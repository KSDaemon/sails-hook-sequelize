module.exports = function (sails) {
    var Sequelize = require('sequelize');

    return {
        defaults: {
            __configKey__: {
                clsNamespace: 'sails-sequelize',
                exposeToGlobal: true
            }
        },
        configure: function () {
            var cls = sails.config[this.configKey].clsNamespace;
            // If custom log function is specified, use it for SQL logging or use sails logger of defined level
            if (typeof cls === 'string' && cls !== '') {
                Sequelize.useCLS(require('continuation-local-storage').createNamespace(cls));
            }
        },
        initialize: function (next) {
            var connection, migrate, sequelize, self = this,
                sequelizeMajVersion = parseInt(Sequelize.version.split('.')[0], 10);

            this.initAdapters();
            this.initModels();

            sails.log.verbose('Using connection named ' + sails.config.models.connection);
            connection = sails.config.connections[sails.config.models.connection];
            if (!connection) {
                throw new Error('Connection \'' + sails.config.models.connection + '\' not found in config/connections');
            }
            if (!connection.options) {
                connection.options = {};
            }

            // If custom log function is specified, use it for SQL logging or use sails logger of defined level
            if (typeof connection.options.logging === 'string' && connection.options.logging !== '') {
                connection.options.logging = sails.log[connection.options.logging];
            }

            if (connection.url) {
                sequelize = new Sequelize(connection.url, connection.options);
            } else {
                sequelize = new Sequelize(connection.database,
                    connection.user,
                    connection.password,
                    connection.options);
            }

            if (sails.config[this.configKey].exposeToGlobal) {
                sails.log.verbose('Exposing \'Sequelize\' globally');
                global['Sequelize'] = Sequelize;
            }

            migrate = sails.config.models.migrate;
            sails.log.verbose('Migration: ' + migrate);

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
                    self.setAssociation(modelDef);
                    self.setDefaultScope(modelDef);
                }

                if (migrate === 'safe') {
                    return next();
                } else {
                    var forceSync = migrate === 'drop';

                    if (connection.dialect === 'postgres') {

                        return sequelize.showAllSchemas().then(function (schemas) {

                            for (modelName in models) {
                                modelDef = models[modelName];
                                var tableSchema = modelDef.options.schema || '';

                                if (tableSchema !== '' && schemas.indexOf(tableSchema) < 0) { // there is no schema in db for model
                                    sequelize.createSchema(tableSchema);
                                    schemas.push(tableSchema);
                                }
                            }

                            sequelize.sync({ force: forceSync }).then(function () {
                                return next();
                            });
                        });

                    } else {
                        sequelize.sync({ force: forceSync }).then(function () {
                            return next();
                        });
                    }
                }
            });
        },

        initAdapters: function () {
            if (typeof (sails.adapters) === 'undefined') {
                sails.adapters = {};
            }
        },

        initModels: function () {
            if (typeof (sails.models) === 'undefined') {
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
