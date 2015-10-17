/**
 * Image.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Sequelize = require('Sequelize');

module.exports = {
  attributes: {
  	url: {
  		type: Sequelize.STRING
  	}
  },
  associations: function () {
	Image.belongsTo(User, {foreignKey: 'owner'});
  },
  options: {
    freezeTableName: false,
    tableName: 'image',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  }
};

