module.exports = function (sails) {
  // test
  global['Sequelize'] = require('sequelize');
  Sequelize.cls = require('continuation-local-storage').createNamespace('sails-sequelize-postgresql');
  return {
    initialize: function (next) {
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
      connection.options.logging = sails.log.verbose; //A function that gets executed everytime Sequelize would log something.

      migrate = sails.config.models.migrate;
      sails.log.verbose('Migration: ' + migrate);

      sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
      global['sequelize'] = sequelize;

      var schemaNames = [];
      return sequelize.showAllSchemas().then(function (schema) {
        schemaNames = schema;
        return schema;
      }).done(function () {
        sails.modules.loadModels(function (err, models) {
          var modelDef, modelName, ref;
          if (err != null) {
            return next(err);
          }

          for (modelName in models) {
            modelDef = models[modelName];
            sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
            global[modelDef.globalId] = sequelize.define(modelDef.globalId, modelDef.attributes, modelDef.options);
            sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
          }

          for (modelName in models) {
            modelDef = models[modelName];

            hook.setAssociation(modelDef);
            hook.setDefaultScope(modelDef);
          }

          if (migrate === 'safe') {
            return next();
          } else {
            var forceSync = migrate === 'drop';

            if (connection.dialect == 'postgres') {
              for (modelName in models) {
                modelDef = models[modelName];
                var tableSchema = modelDef.options.schema || '';
                // create schema before sync
                var schemaExisted = _.some(schemaNames, function (schema) {
                  return schema == tableSchema;
                });
                if (!schemaExisted && tableSchema != '') {
                  // create schema
                  sequelize.createSchema(tableSchema);
                }
              }
            }
            sequelize.sync({force: forceSync}).then(function () {
              return next();
            });
          }
        });
        return true;
      });
    },

    initAdapters: function () {
      if (sails.adapters === undefined) {
        sails.adapters = {};
      }
    },

    initModels: function () {
      if (sails.models === undefined) {
        sails.models = {};
      }
    },

    setAssociation: function (modelDef) {
      if (modelDef.associations != null) {
        sails.log.verbose('Loading associations for \'' + modelDef.globalId + '\'');
        if (typeof modelDef.associations === 'function') {
          modelDef.associations(modelDef);
        }
      }
    },

    setDefaultScope: function (modelDef) {
      if (modelDef.defaultScope != null) {
        sails.log.verbose('Loading default scope for \'' + modelDef.globalId + '\'');
        var model = global[modelDef.globalId];
        if (typeof modelDef.defaultScope === 'function') {
          var defaultScope = modelDef.defaultScope() || {};
          model.addScope('defaultScope', defaultScope, {override: true});
        }
      }
    }
  };
};