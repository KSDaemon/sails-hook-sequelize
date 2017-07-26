module.exports = function (sails) {
  global.Sequelize = require('sequelize');
  Sequelize.cls = require('continuation-local-storage').createNamespace('sails-sequelize-postgresql');
  return {
    initialize: function (next) {
      var connection, migrate, sequelize,
        sequelizeMajVersion = parseInt(Sequelize.version.split('.')[0], 10),
        hook = this;

      hook.initAdapters();
      hook.initModels();

      sails.log.verbose('Using connection named ' + sails.config.models.connection);
      connection = sails.config.connections[sails.config.models.connection];
      if (!connection) {
        throw new Error('Connection \'' + sails.config.models.connection + '\' not found in config/connections');
      }
      if (!connection.options) {
        connection.options = {};
      }
      //A function that gets executed everytime Sequelize would log something.
      connection.options.logging = connection.options.logging || sails.log.verbose;

      migrate = sails.config.models.migrate;
      sails.log.verbose('Migration: ' + migrate);

      if (connection.url) {
        sequelize = new Sequelize(connection.url, connection.options);
      } else {
        sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
      }
      global.sequelize = sequelize;
      return sails.modules.loadModels(function (err, models) {
        var modelDef, modelName, modelClass, cm, im;
        if (err) {
          return next(err);
        }
        for (modelName in models) {
          modelDef = models[modelName];
          sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
          modelClass = sequelize.define(modelDef.globalId, modelDef.attributes, modelDef.options);

          if (sequelizeMajVersion >= 4) {
            for (cm in modelDef.options.classMethods) {
              modelClass[cm] = modelDef.options.classMethods[cm];
            }

            for (im in modelDef.options.instanceMethods) {
              modelClass.prototype[im] = modelDef.options.instanceMethods[im];
            }
          }

          global[modelDef.globalId] = modelClass;
          sails.models[modelDef.globalId.toLowerCase()] = modelClass;
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
          sequelize.sync({ force: forceSync }).then(function () {
            return next();
          });
        }
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
      if (modelDef.associations !== null) {
        sails.log.verbose('Loading associations for \'' + modelDef.globalId + '\'');
        if (typeof modelDef.associations === 'function') {
          modelDef.associations(modelDef);
        }
      }
    },

    setDefaultScope: function (modelDef) {
      if (modelDef.defaultScope !== null) {
        sails.log.verbose('Loading default scope for \'' + modelDef.globalId + '\'');
        var model = global[modelDef.globalId];
        if (typeof modelDef.defaultScope === 'function') {
          var defaultScope = modelDef.defaultScope() || {};
          model.addScope('defaultScope', defaultScope, { override: true });
        }
      }
    }
  };
};
