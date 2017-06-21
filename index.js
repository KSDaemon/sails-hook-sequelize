const omit = require('lodash/omit');
const merge = require('lodash/merge');
const union = require('lodash/union');
const toLower = require('lodash/toLower');
const endsWith = require('lodash/endsWith');

module.exports = function(sails) {
  global['Sequelize'] = require('sequelize');
  Sequelize.cls = require('continuation-local-storage').createNamespace('sails-sequelize-postgresql');
  return {
    initialize: function(next) {
      var hook = this,
        modelList = [];
      hook.initAdapters();
      hook.initModels();

      var connection, migrate, sequelize;
      sails.log.verbose('Using connection named ' + sails.config.models.connection);
      connection = sails.config.connections[sails.config.models.connection];
      if (connection == null) {
        throw new Error('Connection \'' + sails.config.models.connection + '\' not found in config/connections');
      }
      if (connection.options == null) {
        connection.options = {};
      }
      connection.options.logging = sails.log.verbose;
      migrate = sails.config.models.migrate;
      sails.log.verbose('Migration: ' + migrate);

      sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
      global['sequelize'] = sequelize;
      return sails.modules.loadModels(function(err, models) {
        if (err != null) {
          return next(err);
        }
        for (let modelName in models) {
          let modelDef;
          models[modelName].options = models[modelName].options? models[modelName].options: {};
          let strainedOptions,
            paranoidSchizophrenia = models[modelName].options.paranoidSchizophrenia;
          modelDef = models[modelName];
          modelDef.extras = {};
          if(modelDef.options.parent){
            modelDef.attributes = merge(modelDef.attributes, models[modelDef.options.parent.toLowerCase()].attributes);
          }
          if(modelDef.options.children){
            modelDef.associations = () => {
              for(let child of modelDef.options.children){
                let childModel = global[models[child.toLowerCase()].globalId],
                  thisModel = global[modelDef.globalId];
                thisModel.belongsTo(childModel, {
                  foreignKey: {
                    name: child + '_id',
                  }
                });
              }
            };
            modelDef.options.classMethods = modelDef.options.classMethods? modelDef.options.classMethods: {};
            modelDef.options.classMethods.getChild = (query) => {
              let include = [],
                thisModel = global[modelDef.globalId];
              for(let child of modelDef.options.children){
                let childModel = global[models[child.toLowerCase()].globalId];
                include.push(childModel);
              }
              query.include = union(query.include, include);
              return thisModel.findOne(query)
                .then((parentJoin) => {
                  let attrib;
                  for(attrib in parentJoin.dataValues){
                    if(parentJoin.dataValues[attrib] && endsWith(attrib,'_id')){
                      attrib = attrib.substring(0, attrib.length - 3);
                      break;
                    }
                  }
                  return {
                    model: attrib,
                    value: parentJoin[attrib]
                  };
                });
            };
            modelDef.options.classMethods.getChildren = (query) => {
              let include = [],
                thisModel = global[modelDef.globalId];
              for(let child of modelDef.options.children){
                let childModel = global[models[child.toLowerCase()].globalId];
                include.push(childModel);
              }
              query.include = union(query.include, include);
              return thisModel.findAll(query)
                .then((parentJoin) => {
                  let result = [];
                  for(let parent of parentJoin){
                    let attrib;
                    for(attrib in parent.dataValues){
                      if(parent.dataValues[attrib] && endsWith(attrib,'_id')){
                        attrib = attrib.substring(0, attrib.length - 3);
                        break;
                      }
                    }
                    result.push({
                      model: attrib,
                      value: parent[attrib]
                    });
                  }
                  return result;
                });
            };
          }
          modelDef.strainedOptions = omit(modelDef.options, ['paranoidSchizophrenia', 'parent', 'children'])
          modelDef.strainedOptions.scopes = modelDef.strainedOptions.scopes ? modelDef.strainedOptions.scopes: {};
          if(paranoidSchizophrenia){
            let deletedAt = modelDef.strainedOptions.underscored? 'deleted_at': 'deletedAt';
            modelDef.attributes.deleted_at = {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: new Date(0),
              get(){
                const date = new Date(this.getDataValue(deletedAt));
                if(date.getTime() == 0){
                  return null;
                }
              },
            };
            modelDef.strainedOptions.defaultScope = modelDef.strainedOptions.defaultScope? modelDef.strainedOptions.defaultScope : {};
            modelDef.strainedOptions.defaultScope = merge({
              where:{
                deleted_at: {
                  $eq: new Date(0),
                },
              },
            }, modelDef.strainedOptions.defaultScope);
            modelDef.strainedOptions.paranoid = true;
            modelDef.strainedOptions.deletedAt = deletedAt;
            modelDef.strainedOptions.scopes = modelDef.strainedOptions.scopes ? modelDef.strainedOptions.scopes: {};
            modelDef.strainedOptions.scopes.drugged = {};
          }
          modelList.push(modelDef);
        }
        for(let modelDef of modelList){
          let parent = toLower(modelDef.options.parent),
            children = toLower(modelDef.options.children),
            attributes = modelDef.options.children? {}: modelDef.attributes;
          sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
          global[modelDef.globalId] = sequelize.define(modelDef.globalId, attributes, modelDef.strainedOptions);
          sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
          if(modelDef.options.parent){
            global[modelDef.globalId].afterCreate('afterChildCreation', (child, options) => {
              let query = {
              };
              query[modelDef.globalId.toLowerCase() + '_id'] = child.id;
              return global[modelDef.options.parent].create(query);
            });
            global[modelDef.globalId].afterDestroy('afterChildDestruction', (child, options) => {
              let query = {
                where: {},
              };
              query.where[modelDef.globalId.toLowerCase() + '_id'] = child.id;
              return global[modelDef.options.parent].destroy(query);
            });
          }
        }

        for (modelName in models) {
          let modelDef = models[modelName];
          hook.setAssociation(modelDef);
          hook.setDefaultScope(modelDef);
        }

        if(migrate === 'safe') {
          return next();
        } else {
          var forceSync = migrate === 'drop';
          sequelize.sync({ force: forceSync }).then(function() {
            return next();
          });
        }
      });
    },

    initAdapters: function() {
      if(sails.adapters === undefined) {
        sails.adapters = {};
      }
    },

    initModels: function() {
      if(sails.models === undefined) {
        sails.models = {};
      }
    },

    setAssociation: function(modelDef) {
      if (modelDef.associations != null) {
        sails.log.verbose('Loading associations for \'' + modelDef.globalId + '\'');
        if (typeof modelDef.associations === 'function') {
          modelDef.associations(modelDef);
        }
      }
    },

    setDefaultScope: function(modelDef) {
      var model = global[modelDef.globalId];
      if (modelDef.defaultScope != null) {
        sails.log.verbose('Loading default scope for \'' + modelDef.globalId + '\'');
        if (typeof modelDef.defaultScope === 'function') {
          model.addScope('defaultScope',defaultScope,{override: true});
        }
      }
    }

  };
};
