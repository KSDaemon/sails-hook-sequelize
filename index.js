"use strict";

module.exports = function(sails) {
  var Sequelize = require('sequelize');
  return {

    defaults: {
      globals: {
        sequelize: true
      },
      __configKey__: {
        namespaceKey: 'sails-sequelize-postgresql'
      }
    },

    configure: function() {
      Sequelize.cls = require('continuation-local-storage').createNamespace(sails.config[this.configKey].namespaceKey);
    },

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
      connection.options.logging = connection.options.logging || sails.log.verbose; //A function that gets executed everytime Sequelize would log something.

      migrate = sails.config.models.migrate;
      sails.log.verbose('Migration: ' + migrate);

      sails.sequelize = sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
      if(sails.config.globals.sequelize) {
        sails.log.verbose("Exposing 'sequelize' globally");
        global['sequelize'] = sequelize;
      }
      return sails.modules.loadModels(function(err, models) {
        var modelDef, modelName, sequelizeModel;
        if (err != null) {
          return next(err);
        }
        for (modelName in models) {
          modelDef = models[modelName];
          sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
          sequelizeModel = sequelize.define(modelDef.globalId, modelDef.attributes, modelDef.options);
          sails.models[modelDef.globalId.toLowerCase()] = sequelizeModel;
          if(sails.config.globals.models) {
            sails.log.verbose("Exposing model '" + modelDef.globalId + "' globally");
            global[modelDef.globalId] = sequelizeModel;
          }
        }

        // This second for loop is intended. For associations we have to setup all models first and after that setup associations
        for (modelName in models) {
          modelDef = models[modelName];
          sequelizeModel = sails.models[modelDef.globalId.toLowerCase()];
          hook.setAssociation(modelDef);
          hook.setDefaultScope(modelDef, sequelizeModel);
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

    setDefaultScope: function(modelDef, sequelizeModel) {
      if (modelDef.defaultScope != null) {
        sails.log.verbose('Loading default scope for \'' + modelDef.globalId + '\'');
        if (typeof modelDef.defaultScope === 'function') {
          var defaultScope = modelDef.defaultScope() || {};
          sequelizeModel.addScope('defaultScope',defaultScope,{override: true});
        }
      }
    }
  };
};
