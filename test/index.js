var proxyquire = require('proxyquire').noCallThru();
require('chai').should();
var extend;
describe('extend JSON', function () {

    beforeEach(function (done) {
        extend = proxyquire('../index', {
            '../header': {
                'foo': 'bar'
            }
        });

        done();
    });

    it('should return the extended JSON as an object when passed in as an object', function (done) {
        extend({
            ">>header": {
                "file": "header"
            }
        }, '../', function (json) {
            (typeof json).should.equal('object');
            done();
        });
    });

    it('should return the extended JSON as a string when passed in as a string', function (done) {
        extend('{">>header":{"file":"header"}}', '../', function (json) {
            (typeof json).should.equal('string');
            done();
        });
    });

    it('should allow the JSON to be extended with a file', function(done) {
        extend({
            '>>header': {
                'file': 'header'
            },
            'content': {
                'hello': 'world'
            }
        }, '../', function (json) {
            json.should.deep.equal({
                'header': {
                    'foo': 'bar'
                },
                'content': {
                    'hello': 'world'
                }
            });

            done();
        });
    });

    it('should allow the JSON to be extended with a function', function(done) {
        var extend = proxyquire('../index', {
            '../header': function (key, name) {
                this.json[name] = ['foo', 'bar'];
            }
        });

        extend({
            '>>header': {
                'function': 'header'
            },
            'content': {
                'hello': 'world'
            }
        }, '../', function (json) {
            json.should.deep.equal({
                'header': ['foo', 'bar'],
                'content': {
                    'hello': 'world'
                }
            });

            done();
        });
    });
});
