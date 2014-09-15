var _ = require('underscore');
var path = require('path');

function extendWithFile(key, name, parent) {
    var file;
    try {
        file = require(path.join(this.requirePath, parent[key].file));
        parent[name] = file;
        delete parent[key];
    }catch(e) {
        return this.callback(e);
    }
}

function extendWithFunction(key, name, parent) {
    var lib;
    try {
        lib = require(path.join(this.requirePath, parent[key].function)).bind(this);
    }catch(e){
        return this.callback(e);
    }

    lib(key, name, parent);
}

function respondWithJSON(callback) {
    switch (this.inputJSON) {
    case 'string':
        callback(null, JSON.stringify(this.json));
        break;
    case 'object':
        callback(null, this.json);
        break;
    }
}

function setUpJSON (json) {
    switch (typeof json) {
    case 'string':
        this.inputJSON = 'string';
        this.json = JSON.parse(json);
        break;
    case 'object':
        this.inputJSON = 'object';
        this.json = _.clone(json);
        break;
    }
}

module.exports = function (json, options, callback) {
    this.requirePath = options.path;
    this.callback = callback;

    setUpJSON(json);

    function iterate (array, parent) {
        array
            .forEach(function (key) {
                if (_.isObject(parent[key]) && !_.isString(parent[key])) {
                    iterate(Object.keys(parent[key]), parent[key]);
                }

                if (key.indexOf(options.pointer) !== 0) {
                    return;
                }

                var name = key.replace(options.pointer, '');

                if (parent[key].file) {
                    return extendWithFile(key, name, parent);
                }

                if (parent[key].function) {
                    extendWithFunction(key, name, parent);
                    delete parent[key];
                    return;
                }
            });
    }

    iterate(Object.keys(this.json), this.json);

    respondWithJSON(callback);
};
