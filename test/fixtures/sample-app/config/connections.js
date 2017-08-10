module.exports.connections = {

    somePostgresqlServer: {
        user: 'postgres',
        password: '',
        database: 'sequelize',
        dialect: 'postgres',
        options: {
            dialect: 'postgres',
            host   : 'localhost',
            port   : 5432,
            logging: 'verbose',
            clsNamespace: 'sails-sequelize'
        }
    }
};
