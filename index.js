function extendWithFile(key, name) {
    var file = require(this.requirePath + this.json[key].file);
    this.json[name] = file;
}

function extendWithFunction(key, name) {
    var lib = require(this.requirePath + this.json[key].function).bind(this);
    lib(key, name);
}

function respondWithJSON(callback) {
    switch (this.inputJSON) {
    case 'string':
        callback(JSON.stringify(this.json));
        break;
    case 'object':
        callback(this.json);
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
        this.json = json;
        break;
    }
}

module.exports = function (json, path, callback) {
    this.inputJSON;
    this.requirePath = path;

    setUpJSON(json);

    Object.keys(this.json)
        .filter(function (key) {
            return key.indexOf('>>') === 0;
        })
        .forEach(function (extendor) {
            var name = extendor.replace('>>', '');

            if (this.json[extendor].file) {
                extendWithFile(extendor, name);
                delete this.json[extendor];
                return;
            }

            if (this.json[extendor].function) {
                extendWithFunction(extendor, name);
                delete this.json[extendor];
                return;
            }
        });

    respondWithJSON(callback);
};
