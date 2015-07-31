# sails-hook-sequelize
Sails.js hook to use sequelize ORM

[![Build Status](https://travis-ci.org/festo/sails-hook-sequelize.svg?branch=master)](https://travis-ci.org/festo/sails-hook-sequelize)
[![npm version](https://badge.fury.io/js/sails-hook-sequelize.svg)](http://badge.fury.io/js/sails-hook-sequelize)


#Install

Install this hook with:

```sh
$ npm install sails-hook-sequelize --save
```

# Configuration

`.sailsrc`
````
"hooks": {
  "orm": false,
  "pubsub": false
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
    logging: true
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
  associate: function() {
    user.hasMany(image, {
      foreignKey: {
        name: 'owner',
        allowNull: false
      }
    });
  },
  options: {
    tableName: 'user',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  }
};
```

#License
[MIT](./LICENSE)