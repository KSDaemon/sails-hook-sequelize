/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    connection: 'sqlite',
    attributes  : {
        name: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.ENUM('USER', 'ADMIN')
        }
    },
    associations: function () {
        Group.hasMany(User, { as: 'users', foreignKey: 'groupId' });
    },
    defaultScope: function () {
        return {
            include: [
                { model: User, as: 'users' }
            ]
        };
    },
    options     : {
        freezeTableName : false,
        tableName       : 'group',
        classMethods    : {},
        instanceMethods : {},
        hooks           : {}
    }
};

