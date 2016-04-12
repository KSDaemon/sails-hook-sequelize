module.exports = function (sails) {
    global['Sequelize'] = require('sequelize');
    Sequelize.cls = require('continuation-local-storage').createNamespace('sails-sequelize-postgresql');
    return {
        initialize: function (next) {
            this.initAdapters();
            this.initModels();

            this.reload(next);
        },

        reload: function (next) {
            var hook = this;
            var defaultConnection = sails.config.connections[sails.config.models.connection]
                , migrate = sails.config.models.migrate
                , sequelize;
            global['sequelize'] = {};

            return sails.modules.loadModels(function (err, models) {
                if (err != null) {
                    return next(err);
                }

                defineModels(models, defaultConnection);

                setAssociationsAndScope(models, hook);

                if (migrate === 'safe') {
                    return next();
                } else {
                    var forceSync = migrate === 'drop';
                    sequelize.sync({force: forceSync}).then(function () {
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

function defineModels(models, defaultConnection) {
    var modelName, modelDef, sequelize, connectionName;

    for (modelName in models) {
        modelDef = models[modelName];
        connectionName = modelDef.options.connection;

        if (connectionName) {
            sequelize = initIfNotExists(sails.config.connections[connectionName], connectionName);
        } else {
            sequelize = initIfNotExists(defaultConnection, sails.config.models.connection);
        }

        sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
        global[modelDef.globalId] = sequelize.define(modelDef.globalId, modelDef.attributes, modelDef.options);
        sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
    }

    if (Object.keys(global['sequelize']).length == 1) {
        global['sequelize'] = sequelize;
    }
}

function initIfNotExists(connection, connectionName) {
    var sequelize;

    if (!global['sequelize'][connectionName]) {
        sequelize = initConnection(connection);
        global['sequelize'][connectionName] = sequelize;
    } else {
        sequelize = global['sequelize'][connectionName];
    }

    return sequelize;
}

function initConnection(connection) {
    var sequelize;

    sails.log.verbose('Using connection named ' + sails.config.models.connection);
    if (connection == null) {
        throw new Error('Connection \'' + sails.config.models.connection + '\' not found in config/connections');
    }
    if (connection.options == null) {
        connection.options = {};
    }
    connection.options.logging = connection.options.logging || sails.log.verbose; //A function that gets executed everytime Sequelize would log something.

    if (connection.url) {
        sequelize = new Sequelize(connection.url, connection.options);
    } else {
        sequelize = new Sequelize(connection.database, connection.user, connection.password, connection.options);
    }

    return sequelize;
}

function setAssociationsAndScope(models, hook) {
    var modelName, modelDef;

    for (modelName in models) {
        modelDef = models[modelName];

        hook.setAssociation(modelDef);
        hook.setDefaultScope(modelDef);
    }
}
