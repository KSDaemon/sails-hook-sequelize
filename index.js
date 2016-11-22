module.exports = function(sails) {
  global['Sequelize'] = require('sequelize');
  Sequelize.cls = require('continuation-local-storage').createNamespace('sails-sequelize-postgresql');
  return {
    initialize: function(next) {
      var hook = this;
      hook.initAdapters();
      hook.initModels();

      var connections = {}, migrate, sequelizes = {}, defaultConnection;
      var defaultConnection = sails.config.models.connection;
      sails.log.verbose('Using connection named ' + defaultConnection);
      for (var id in sails.config.connections)
      {
          var connection = sails.config.connections[id];
          if (connection == null) {
              throw new Error('Connection \'' + id + '\' not found in config/connections');
          }
          if (connection.options == null) {
              connection.options = {};
          }
          if (connection.options == null) {
              connection.options = {};
          }
          connection.options.logging = connection.options.logging || sails.log.verbose; //A function that gets executed everytime Sequelize would log something.
          if (connection.url) {
              sequelizes[id] = new Sequelize(connection.url, connection.options);
          } else {
              sequelizes[id] = new Sequelize(connection.database, connection.user, connection.password, connection.options);
          }
      }
      migrate = sails.config.models.migrate;
      sails.log.verbose('Migration: ' + migrate);

      global['sequelize']  = sequelizes[defaultConnection];
      global['sequelizes'] = sequelizes;
      return sails.modules.loadModels(function(err, models) {
      var modelDef, modelName, ref;
      if (err != null) {
        return next(err);
      }
      for (modelName in models) {
        modelDef = models[modelName];
        sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
        var connection = modelDef.connection || defaultConnection;
        global[modelDef.globalId] = sequelizes[connection].define(modelDef.globalId, modelDef.attributes, modelDef.options);
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
        var syncd = 0;
        var total = 0;
        for (var id in sequelizes){
          total ++;
          sequelizes[id].sync({ force: forceSync }).then(function() {
            syncd++;
            if (total == syncd){
              return next();
            }
          });
        }
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
      if (modelDef.defaultScope != null) {
        sails.log.verbose('Loading default scope for \'' + modelDef.globalId + '\'');
        var model = global[modelDef.globalId];
        if (typeof modelDef.defaultScope === 'function') {
          var defaultScope = modelDef.defaultScope() || {};
          model.addScope('defaultScope',defaultScope,{override: true});
        }
      }
    }
  };
};