/**
 * Image.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    connection: 'memory',
    attributes: {
        name  : {
            type         : 'string'
        },
        goodId: {
            type         : 'integer',
            autoIncrement: true
        }
    }
};

