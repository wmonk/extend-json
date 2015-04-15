var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');

function extendJson(json, options) {
    Object.keys(json).map(function (key) {
        if (typeof json[key] === 'object') {
            return extendJson(json[key], options);
        }

        if (key.indexOf(options.pointer) !== -1) {
            var extendedJson = require(path.join(options.path, json[key]));
            newKey = Object.keys(extendedJson)[0];
            json[newKey] = extendedJson[newKey];
            delete json[key];
        }
    });

    return json;
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
        return extendJson(json, options);
    });
};
