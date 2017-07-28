# sails-hook-sequelize
Sails.js hook to use sequelize ORM

[![Build Status](https://travis-ci.org/festo/sails-hook-sequelize.svg?branch=master)](https://travis-ci.org/festo/sails-hook-sequelize)
[![npm version](https://badge.fury.io/js/sails-hook-sequelize.svg)](http://badge.fury.io/js/sails-hook-sequelize)

# Update
Sorry guys that I haven't been around to maintain this project! This project has not been actively maintained and I'm terribly sorry for that.

I would love to have someone to help as active contributors to this project, if you're interested please do email me at gergely.munkacsy (at) gmail.com, and we'll work something out! Thank you so much guys!!

#Install

Install this hook with:

```sh
$ npm install sails-hook-sequelize --save
```

# Configuration

`.sailsrc`
````
{
  "hooks": {
    "orm": false,
    "pubsub": false
  }
}
```

## Connections
Sequelize connection
```javascript
somePostgresqlServer: {
  user: 'postgres',
  password: '',
  database: 'sequelize',
  dialect: 'postgres',
  options: {
    dialect: 'postgres',
    host   : 'localhost',
    port   : 5432,
    logging: console.log,
    namespace: 'clsEnabledIfSet' //cls namspace, null or undefined to disable CLS
  }
}
```

## Models
Sequelize model definition
`models/user.js`
```javascript
module.exports = {
  attributes: {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    age: {
      type: Sequelize.INTEGER
    }
  },
  associations: function() {
    user.hasMany(image, {
      foreignKey: {
        name: 'owner',
        allowNull: false
      }
    });
  },
  defaultScope: function() {
    return {
      include: [
        {model: image, as: 'images'}
      ]
    }
  },
  options: {
    tableName: 'user',
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    scopes: {}
  }
};
```

#License
[MIT](./LICENSE)
