[![forthebadge](http://forthebadge.com/images/badges/built-by-codebabes.svg)](https://jaque.me/)

[![npm version](https://badge.fury.io/js/sails-hook-fireline.svg)](http://badge.fury.io/js/sails-hook-fireline)
[![Stories in Progress](https://img.shields.io/waffle/label/malpercio/sails-hook-fireline/in%20progress.svg?style=flat)](https://waffle.io/malpercio/sails-hook-fireline)
[![Build Status](https://travis-ci.org/malpercio/sails-hook-fireline.svg?branch=master)](https://travis-ci.org/malpercio/sails-hook-fireline)
[![Dependencies](https://david-dm.org/malpercio/sails-hook-fireline.svg)](https://travis-ci.org/malpercio/sails-hook-fireline)
[![DevDependencies](https://david-dm.org/malpercio/sails-hook-fireline/dev-status.svg)](https://david-dm.org/malpercio/sails-hook-fireline)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/malpercio/sails-hook-fireline/master/LICENSE)


# sails-hook-fireline
Sails.js hook to use sequelize ORM.
It's like Waterline but so much hotter. (Also, exclusive to SQL DB's)


# Install

Install this hook with:

```bash
$ npm install sails-hook-fireline --save
```

# Configuration

Modify `.sailsrc` to resemble the next file:
```json
{
  "hooks": {
    "orm": false,
    "pubsub": false
  }
}
```

## Connections
To make a connection, configure sails like so
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
    logging: console.log
  }
}
```

## Models
An example of model configuration on `models/user.js`
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
  options: {
    tableName: 'user',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  }
};
```

## Sequelize Extensions
To avoid a potential loss of an unique index when using `deletedAt` (for unicity and softDelete),
an option can be passed to the model, making its default zero, avoiding such SQL halting experience.

```javascript
module.exports = {
  attributes: {},
  associations: () => {},
  options: {
    classMethods: {},
    instanceMethods: {},
    hooks: {},
    paranoidSchizophrenia: true,
  }
};
```
It work just the same, except for some minor changes:
* Default value for `deletedAt` is Date(0)
* When `deletedAt` is accessed, if date is Date(0), it will return `null` (custom getter)
* Queries including the aforementioned model, will default to inner-joins **BEWARE**
* When making queries in `paranoid: false`, a non-default scope must be used.
  This package provides the `drugged` scope that has no effect whatsoever.
  ```js
  //All three are equivalent
  let query = {
    where: {},
    paranoid: false,
  };
  User.scope(null)findAll(query);
  User.scope('drugged')findAll(query);
  User.unscoped()findAll(query);
  ```

## Special Thanks
A big shoutout to Gergely Munkacsy for starting the base of this fork at `sails-hook-sequelize`.
(I'm in a hurry, but I promise I will link you back)

## License
[MIT](./LICENSE)
