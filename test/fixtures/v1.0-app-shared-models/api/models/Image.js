/**
 * Image.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes  : {
        url: {
            type: Sequelize.STRING
        }
    },
    associations: function (modelDef) {
        Image[modelDef.connection].belongsTo(User[modelDef.connection], { foreignKey: 'userId' });
    },
    options     : {
        freezeTableName : false,
        tableName       : 'image',
        schema          : 'sails',
        classMethods    : {},
        instanceMethods : {},
        hooks           : {}
    }
};

