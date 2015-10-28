/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Sequelize = require('sequelize');

module.exports = {
  attributes: {
  	name: {
  		type: Sequelize.STRING
  	},
    age: {
    	type: Sequelize.INTEGER
    }
  },
  associations: function () {
  	User.hasMany(Image, {as: 'images', foreignKey: 'owner'});
  },
  defaultScope: function() {
    return {
      include: [
        {model: Image, as: 'images'}
      ]
    }
  },
  options: {
    freezeTableName: false,
    tableName: 'user',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  }
};
