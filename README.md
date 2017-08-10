# sails-hook-sequelize
Sails.js hook to use sequelize ORM

[![Build Status](https://travis-ci.org/festo/sails-hook-sequelize.svg?branch=master)](https://travis-ci.org/festo/sails-hook-sequelize)
[![npm version](https://badge.fury.io/js/sails-hook-sequelize.svg)](http://badge.fury.io/js/sails-hook-sequelize)

# Installation

Install this hook with:

```sh
$ npm install sails-hook-sequelize --save
```

# Configuration

`.sailsrc`

```
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
    namespace: 'clsEnabledIfSet' // cls support, undefined/false to disable
    loglevel: false, // debug/verbose/false - enable query logging by default at specified level or disable
  }
}
```

## Models

Sequelize model definition `models/user.js`

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

# Contributors
This project was originally created by Gergely Munkácsy (@festo). 
Now is maintained by Konstantin Burkalev (@KSDaemon).

# License
[MIT](./LICENSE)
