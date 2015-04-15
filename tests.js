require('chai').should();
var proxyquire = require('proxyquire').noCallThru();
var extendJSON;

describe('JSON extendor', function () {

    it('should allow the JSON to be extended with a file (with top level key i.e slot)', function (done) {
        var fileA = {
            'slot1': 'val1',
            '>>fileB': 'fileB.json'
        };

        var fileB = {
            'slot2': {
                'config': 'items'
            }
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

    it('should allow the JSON to be extended with a file (with no keys i.e component)', function (done) {
        var fileA = {
            'slot1': {
                'components': [{
                    'type': 'identity'
                }, {
                    '<<fileC': 'fileC.json'
                }]
            }
        };

        var fileC = {
            'type': 'personalisation'
        };
        extendJSON = proxyquire('./index', {
            'fileC.json': fileC
        });
        extendJSON(fileA, {pointer:'<<'}).then(function (json) {
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

    it('should catch if file is not found', function (done) {
        var fileA = {
            'slot1': 'val1',
            '<<fileX': 'fileX.json'
        };

        var fileX = {};
        extendJSON = require('./index');
        extendJSON(fileA, {pointer:'<<'}).catch(function (err) {
            err.toString().should.contain('Cannot find module');
            err.toString().should.contain('fileX');
            done();
        }).catch(done);

    });

});
