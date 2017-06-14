const omit = require('lodash/omit');
module.exports = function(sails) {
  global['Sequelize'] = require('sequelize');
  Sequelize.cls = require('continuation-local-storage').createNamespace('sails-sequelize-postgresql');
  return {
    initialize: function(next) {
      var hook = this;
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
        var modelDef, modelName, ref;
        if (err != null) {
          return next(err);
        }
        for (modelName in models) {
          let strainedOptions,
            paranoidSchizophrenia = models[modelName].options.paranoidSchizophrenia;
          modelDef = models[modelName];
          strainedOptions = omit(modelDef.options, ['paranoidSchizophrenia'])
          if(paranoidSchizophrenia){
            let deletedAt = strainedOptions.underscored? 'deleted_at': 'deletedAt';
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
            strainedOptions.defaultScope = {
              where:{
                deleted_at: {
                  $eq: new Date(0),
                },
              },
            };
            strainedOptions.paranoid = true;
            strainedOptions.deletedAt = deletedAt;
            strainedOptions.scopes = strainedOptions.scopes ? strainedOptions.scopes: {};
            strainedOptions.scopes.drugged = {};
          }
          sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
          global[modelDef.globalId] = sequelize.define(modelDef.globalId, modelDef.attributes, strainedOptions);
          sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
        }

        for (modelName in models) {
          modelDef = models[modelName];

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
