require('chai').should();
var proxyquire = require('proxyquire').noCallThru();
var extendJSON;

describe('JSON extendor', function () {

    it('should allow object in JSON to be extended with a file', function (done) {
        var fileA = {
            'slot1': 'val1',
            '>>slot2': {
                'file': 'fileB.json'
            }
        };

        var fileB = {
            'config': 'items'
        };
        extendJSON = proxyquire('./index', {
            'fileB.json': fileB
        });
        extendJSON(fileA).then(function (json) {
            json.should.deep.equal({
                'slot1': 'val1',
                'slot2': {
                    'config': 'items'
                }
            });
            done();
        }).catch(done);
    });

    it('should allow array in JSON to be extended with a file', function (done) {
        var fileA = {
            'slot1': {
                'components': [{
                    'type': 'identity'
                }, {
                    '<<fileC': {
                        'file': 'fileC.json',
                        'replace': true
                    }
                }]
            }
        };

        var fileC = {
            'type': 'personalisation'
        };
        extendJSON = proxyquire('./index', {
            'fileC.json': fileC
        });
        extendJSON(fileA, {
            pointer: '<<'
        }).then(function (json) {
            json.should.deep.equal({
                'slot1': {
                    'components': [{
                        'type': 'identity'
                    }, {
                        'type': 'personalisation'
                    }]
                }
            });
            done();
        }).catch(done);
    });

    it('should allow object and array in JSON to be extended with a file', function (done) {
        var fileA = {
            'slot1': 'val1',
            '<<slot2': {
                'file': 'fileB.json'
            },
            'slot3': {
                'components': [{
                    'type': 'identity'
                }, {
                    '<<fileC': {
                        'file': 'fileC.json',
                        'replace': true
                    }
                }, {
                    'type': 'callcenter'
                }]
            }
        };

        var fileB = {
            'config': 'items'
        };

        var fileC = {
            'type': 'personalisation'
        };
        extendJSON = proxyquire('./index', {
            'fileB.json': fileB,
            'fileC.json': fileC
        });

        extendJSON(fileA, {
            pointer: '<<'
        }).then(function (json) {
            json.should.deep.equal({
                'slot1': 'val1',
                'slot2': {
                    'config': 'items'
                },
                'slot3': {
                    'components': [{
                        'type': 'identity'
                    }, {
                        'type': 'personalisation'
                    }, {
                        'type': 'callcenter'
                    }]
                }
            });
            done();
        }).catch(done);
    });

    it('should catch if file is not found', function (done) {
        var fileA = {
            'slot1': 'val1',
            '<<fileX': {
                'file': 'fileX.json'
            }
        };

        var fileX = {};
        extendJSON = require('./index');
        extendJSON(fileA, {
            pointer: '<<'
        }).catch(function (err) {
            err.toString().should.contain('Cannot find module');
            err.toString().should.contain('fileX');
            done();
        }).catch(done);

    });

});
