/**
* UserGroup.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
  	name: {
  		type: Sequelize.STRING
  	},
    role: {
    	type: Sequelize.ENUM('USER', 'ADMIN')
    }    
  },
  associations: function () {
  	UserGroup.hasMany(User, {as: 'users', foreignKey: 'group'});
  },
  defaultScope: function() {
    return {
      include: [
        {model: User, as: 'users'}
      ]
    };
  },
  options: {
    freezeTableName: false,
    tableName: 'user_group',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  }
};

