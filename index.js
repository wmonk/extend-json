var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');

var array = [];

function findPointer(json, options) {
    if (_.isArray(json)) {
        array = json;
    }

    Object.keys(json).map(function (key) {
        if (typeof json[key] === 'object' && key.indexOf(options.pointer) === -1) {
            return findPointer(json[key], options);
        }

        if (key.indexOf(options.pointer) !== -1) {
            extendJson(json, key, array, options);
        }
    });

    return json;
}

function extendJson(json, key, jsonArray, options) {
    var extendedJson = require(path.join(options.path, json[key].file));

    if (json[key].replace) {
        var arrayIndex = _.findIndex(jsonArray, json);
        jsonArray[arrayIndex] = extendedJson;
    } else {
        var newKey = key.replace(options.pointer, '');
        json[newKey] = extendedJson;
        delete json[key];
    }
}



module.exports = function (json, options) {
    if (!options) {
        options = {};
    }

    options = _.defaults(options, {
        pointer: '>>',
        path: './'
    });

    return Promise.try(function () {
        return findPointer(json, options);
    });
};
