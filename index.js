module.exports = sails => {
    const Sequelize = require('sequelize');

    // keep a ref to the original sails model loader function
    const originalLoadModels = sails.modules.loadModels;

    return {
        defaults: {
            __configKey__: {
                clsNamespace: 'sails-sequelize',
                exposeToGlobal: true
            }
        },
        configure() {
            const cls = sails.config[this.configKey].clsNamespace;
            // If custom log function is specified, use it for SQL logging or use sails logger of defined level
            if (typeof cls === 'string' && cls !== '') {
                Sequelize.useCLS(require('continuation-local-storage').createNamespace(cls));
            }

            if (sails.config[this.configKey].exposeToGlobal) {
                sails.log.verbose('Exposing Sequelize globally');
                global['Sequelize'] = Sequelize;
            }

            // Override sails internal loadModels function
            // needs to be done in configure()
            sails.modules.loadModels = function load(cb) {

                // call the original sails loadModels function so we have access to it's returned models
                originalLoadModels((err, modelDefs) => {
                    // modelDefs = all the model files from models directory - sails does this
                    // now modify / return own models for sails to boot
                    const models = {};

                    sails.log.verbose('Detecting Waterline models');
                    Object.entries(modelDefs).forEach((entry) => {
                        const [key, model] = entry;

                        if (typeof (model.options) === 'undefined' || typeof (model.options.tableName) === 'undefined') {
                            sails.log.verbose('Loading Waterline model \'' + model.globalId + '\'');
                            models[key] = model;
                        }
                    });

                    // return the models that the sails orm hook will bootstrap
                    cb(err, models);
                });
            };
        },
        initialize(next) {

            if (sails.config.hooks.orm === false) {
                this.initAdapters();
                this.initModels();
                this.reload(next);
            } else {
                sails.on('hook:orm:loaded', () => {

                    this.initAdapters();
                    this.initModels();
                    this.reload(next);

                });
            }
        },

        reload(next) {
            let connections;
            const self = this;

            connections = this.initConnections();

            if (sails.config[this.configKey].exposeToGlobal) {
                sails.log.verbose('Exposing Sequelize connections globally');
                global['SequelizeConnections'] = connections;
            }

            return originalLoadModels((err, models) => {

                if (err) {
                    return next(err);
                }

                self.defineModels(models, connections);
                self.migrateSchema(next, connections, models);
            });
        },

        initAdapters() {
            if (typeof (sails.adapters) === 'undefined') {
                sails.adapters = {};
            }
        },

        initConnections() {
            const connections = {};
            let connection, connectionName;

            // Try to read settings from old Sails then from the new.
            // 0.12: sails.config.connections & sails.config.models.connection
            // 1.00: sails.config.datastores & sails.config.models.datastore
            const datastores = sails.config.connections || sails.config.datastores;
            const datastoreName = sails.config.models.connection || sails.config.models.datastore || 'default';

            sails.log.verbose('Using default connection named ' + datastoreName);
            if (!Object.prototype.hasOwnProperty.call(datastores, datastoreName)) {
                throw new Error('Default connection \'' + datastoreName + '\' not found in config/connections');
            }

            for (connectionName in datastores) {
                connection = datastores[connectionName];

                // Skip waterline and possible non sequelize connections
                if (connection.adapter || !(connection.dialect || connection.options.dialect)) {
                    continue;
                }

                if (!connection.options) {
                    connection.options = {};
                }

                // If custom log function is specified, use it for SQL logging or use sails logger of defined level
                if (typeof connection.options.logging === 'string' && connection.options.logging !== '') {
                    connection.options.logging = sails.log[connection.options.logging];
                }

                if (connection.url) {
                    connections[connectionName] = new Sequelize(connection.url, connection.options);
                } else {
                    connections[connectionName] = new Sequelize(connection.database,
                        connection.user,
                        connection.password,
                        connection.options);
                }
            }

            return connections;
        },

        initModels() {
            if (typeof (sails.models) === 'undefined') {
                sails.models = {};
            }
        },

        defineModels(models, connections) {
            let modelDef, modelName, modelClass, cm, im, connectionName;
            const sequelizeMajVersion = parseInt(Sequelize.version.split('.')[0], 10);

            // Try to read settings from old Sails then from the new.
            // 0.12: sails.config.models.connection
            // 1.00: sails.config.models.datastore
            const defaultConnection = sails.config.models.connection || sails.config.models.datastore || 'default';

            for (modelName in models) {
                modelDef = models[modelName];

                // Skip models without options provided (possible Waterline models)
                if (!modelDef.options) {
                    continue;
                }

                sails.log.verbose('Loading Sequelize model \'' + modelDef.globalId + '\'');
                connectionName = modelDef.connection || modelDef.datastore || defaultConnection;
                modelClass = connections[connectionName].define(modelDef.globalId,
                    modelDef.attributes,
                    modelDef.options);

                if (sequelizeMajVersion >= 4) {
                    for (cm in modelDef.options.classMethods) {
                        modelClass[cm] = modelDef.options.classMethods[cm];
                    }

                    for (im in modelDef.options.instanceMethods) {
                        modelClass.prototype[im] = modelDef.options.instanceMethods[im];
                    }
                }

                if (sails.config.globals.models) {
                    sails.log.verbose('Exposing model \'' + modelDef.globalId + '\' globally');
                    global[modelDef.globalId] = modelClass;
                }
                sails.models[modelDef.globalId.toLowerCase()] = modelClass;
            }

            for (modelName in models) {
                modelDef = models[modelName];

                // Skip models without options provided (possible Waterline models)
                if (!modelDef.options) {
                    continue;
                }

                this.setAssociation(modelDef);
                this.setDefaultScope(modelDef, sails.models[modelDef.globalId.toLowerCase()]);
            }
        },

        setAssociation(modelDef) {
            if (modelDef.associations !== null) {
                sails.log.verbose('Loading associations for \'' + modelDef.globalId + '\'');
                if (typeof modelDef.associations === 'function') {
                    modelDef.associations(modelDef);
                }
            }
        },

        setDefaultScope(modelDef, model) {
            if (modelDef.defaultScope !== null) {
                sails.log.verbose('Loading default scope for \'' + modelDef.globalId + '\'');
                if (typeof modelDef.defaultScope === 'function') {
                    const defaultScope = modelDef.defaultScope() || {};
                    model.addScope('defaultScope', defaultScope, { override: true });
                }
            }
        },

        migrateSchema(next, connections, models) {
            let connectionDescription, cn, migrate, forceSyncFlag, alterFlag;
            const syncTasks = [];

            // Try to read settings from old Sails then from the new.
            // 0.12: sails.config.connections
            // 1.00: sails.config.datastores
            const datastores = sails.config.connections || sails.config.datastores;

            migrate = sails.config.models.migrate;
            sails.log.verbose('Models migration strategy: ' + migrate);

            if (migrate === 'safe') {
                return next();
            } else {
                switch (migrate) {
                    case 'drop':
                        forceSyncFlag = true;
                        alterFlag = false;
                        break;
                    case 'alter':
                        forceSyncFlag = false;
                        alterFlag = true;
                        break;
                    default:
                        forceSyncFlag = false;
                        alterFlag = false;
                }

                for (cn in datastores) {
                    (function (connectionName) {
                        var syncConnectionName = connectionName;
                        connectionDescription = datastores[syncConnectionName];

                        // Skip waterline and possible non sequelize connections
                        if (connectionDescription.adapter ||
                            !(connectionDescription.dialect || connectionDescription.options.dialect)) {
                            return;
                        }

                        sails.log.verbose('Migrating schema in \'' + connectionName + '\' connection');

                        if (connectionDescription.dialect === 'postgres') {

                            syncTasks.push(connections[syncConnectionName].showAllSchemas().then(schemas => {
                                let modelName, modelDef, tableSchema;

                                for (modelName in models) {
                                    modelDef = models[modelName];
                                    tableSchema = modelDef.options.schema || '';

                                    if (tableSchema !== '' && schemas.indexOf(tableSchema) < 0) { // there is no schema in db for model
                                        connections[syncConnectionName].createSchema(tableSchema);
                                        schemas.push(tableSchema);
                                    }
                                }
                                console.log('migrateSchema in ' + syncConnectionName);
                                return connections[syncConnectionName].sync({ force: forceSyncFlag, alter: alterFlag });
                            }));

                        } else {
                            syncTasks.push(connections[syncConnectionName].sync({
                                force: forceSyncFlag,
                                alter: alterFlag
                            }));
                        }
                    }(cn));
                }

                Promise.all(syncTasks).then(() => next()).catch(e => next(e));

            }
        }
    };
};
