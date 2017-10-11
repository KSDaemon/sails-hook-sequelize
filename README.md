# sails-hook-sequelize
Sails.js hook to use sequelize ORM

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Code coverage][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![DevDependency Status][depstat-dev-image]][depstat-dev-url]
[![MIT License][license-image]][license-url]


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

Also you can set some parameters in `config/sequelize.js` to override defaults.

```
module.exports.sequelize = {
    "clsNamespace": "myAppCLSNamespace",
    "exposeToGlobal": true
};
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
    logging: console.log        // or specify sails log level to use ('info', 'warn', 'verbose', etc)
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
    scopes: {},
    connection: 'NotDefaultModelsConnection'    // Can be omitted, so default sails.config.models.connection will be used 
  }
};
```

# Contributors
This project was originally created by Gergely Munkácsy (@festo). 
Now is maintained by Konstantin Burkalev (@KSDaemon).

# License
[MIT](./LICENSE)

[npm-url]: https://www.npmjs.com/package/sails-hook-sequelize
[npm-image]: https://img.shields.io/npm/v/sails-hook-sequelize.svg?style=flat

[travis-url]: https://travis-ci.org/KSDaemon/sails-hook-sequelize
[travis-image]: https://img.shields.io/travis/KSDaemon/sails-hook-sequelize/master.svg?style=flat

[coveralls-url]: https://coveralls.io/github/KSDaemon/sails-hook-sequelize
[coveralls-image]: https://img.shields.io/coveralls/KSDaemon/sails-hook-sequelize/master.svg?style=flat

[depstat-url]: https://david-dm.org/KSDaemon/sails-hook-sequelize
[depstat-image]: https://david-dm.org/KSDaemon/sails-hook-sequelize.svg?style=flat

[depstat-dev-url]: https://david-dm.org/KSDaemon/sails-hook-sequelize
[depstat-dev-image]: https://david-dm.org/KSDaemon/sails-hook-sequelize/master-status.svg?style=flat

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: http://opensource.org/licenses/MIT
