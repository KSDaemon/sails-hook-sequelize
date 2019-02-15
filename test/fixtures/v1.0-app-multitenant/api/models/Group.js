/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes  : {
        name: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.ENUM('USER', 'ADMIN')
        }
    },
    associations: function (modelDef) {
        Group[modelDef.connection].hasMany(User[modelDef.connection], { as: 'users', foreignKey: 'groupId' });
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
        schema          : 'sails',
        classMethods    : {},
        instanceMethods : {},
        hooks           : {}
    }
};

