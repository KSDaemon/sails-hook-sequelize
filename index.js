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
            /* Declare the global sequelize object */
            global['sequelize'] = {};

            return sails.modules.loadModels(function (err, models) {
                if (err != null) {
                    return next(err);
                }

                /*
                 * Loop through the existing models, initialize sequelize connection for each new connection defined in the
                 * models and then define and inject the models
                 */
                defineModels(models, defaultConnection);

                /*
                 * Loop through the existing models and initialize the declared associations and scopes
                 */
                setAssociationsAndScope(models, hook);

                if (migrate === 'safe') {
                    return next();
                } else {
                    var forceSync = migrate === 'drop';
                    if (Object.keys(global['sequelize']).length == 1) {
                        Object.keys(global['sequelize']).forEach(function (sequelizeInstance) {
                            sequelizeInstance.sync({force: forceSync}).then(function () {
                                return next();
                            });
                        });
                    } else {
                        global['sequelize'].sync({force: forceSync}).then(function () {
                            return next();
                        });
                    }
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

/**
 * Initializes sequelize connection instances and defines the models.
 *
 * Loop through the existing models, initialize sequelize connection for each new (non-existing in the global sequelize
 * connection instances pool) connection defined in the models and then define and inject the models.
 *
 * @param {list}    models            A list of the existing models
 * @param {object}  defaultConnection The default connection object declared in sails.config.models
 */
function defineModels(models, defaultConnection) {
    var modelName, modelDef, sequelize, connectionName;

    for (modelName in models) {
        modelDef = models[modelName];
        // Get current model connection
        connectionName = modelDef.options.connection;

        /*
         * If a connection was defined in the model - init a connection with that connection name.
         * Otherwise - with the default one
         */
        if (connectionName) {
            sequelize = initIfNotExists(sails.config.connections[connectionName], connectionName);
        } else {
            sequelize = initIfNotExists(defaultConnection, sails.config.models.connection);
        }

        /* Define the models and add them to the global models pool */
        sails.log.verbose('Loading model \'' + modelDef.globalId + '\'');
        global[modelDef.globalId] = sequelize.define(modelDef.globalId, modelDef.attributes, modelDef.options);
        sails.models[modelDef.globalId.toLowerCase()] = global[modelDef.globalId];
    }

    /*
     * If there is only 1 connection in the global sequelize connections pool, it means there's no multiple data stores
     * for this server, so just assign the current sequelize instance to the global sequelize variable, so that everything
     * works as before for people's projects.
     */
    if (Object.keys(global['sequelize']).length == 1) {
        global['sequelize'] = sequelize;
    }
}

/**
 * Checks if a connection instance with the current connection name already exists in the global sequelize connections
 * pool. If yes - just grab it from the pool and return it. Otherwise - initialize a new connection instance, add it to
 * the global pool and return it.
 *
 * @param {object}  connection      An object that holds the options for the specific connections to be initialized
 * @param {string}  connectionName  The name of the specific connection to check against
 * @returns {object}  sequelize     The sequelize connection instance
 */
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

/**
 * Initializes a new sequelize connection instance and returns it.
 *
 * @param {object}  connection  An object that holds the options for the specific connections to be initialized
 * @returns {object}    sequelize   The sequelize connection instance
 */
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

/**
 * Loops through the existing models and initializes the declared associations and scopes.
 *
 * @param {list}    models  A list of the existing models, as objects
 * @param {object}  hook    This hook, yeah!
 */
function setAssociationsAndScope(models, hook) {
    var modelName, modelDef;

    for (modelName in models) {
        modelDef = models[modelName];

        hook.setAssociation(modelDef);
        hook.setDefaultScope(modelDef);
    }
}
