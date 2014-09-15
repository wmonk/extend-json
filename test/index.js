var proxyquire = require('proxyquire').noCallThru();
var should = require('chai').should();
var extend;
var options = {
    path: '../',
    pointer: '>>'
};
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
        }, options, function (err, json) {
            (typeof json).should.equal('object');
            done();
        });
    });

    it('should return the extended JSON as a string when passed in as a string', function (done) {
        extend('{">>header":{"file":"header"}}', options, function (err, json) {
            (typeof json).should.equal('string');
            done();
        });
    });

    it('should allow the JSON to be extended with a file', function (done) {
        extend({
            '>>header': {
                'file': 'header'
            },
            'content': {
                'hello': 'world'
            }
        }, options, function (err, json) {
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

    it('should allow the JSON to be extended with a function', function (done) {
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
        }, options, function (err, json) {
            json.should.deep.equal({
                'header': ['foo', 'bar'],
                'content': {
                    'hello': 'world'
                }
            });

            done();
        });
    });

    it('should recursively populate JSON files', function (done) {
        var extend = proxyquire('../index', {
            '../header': {
                'foo': 'bar'
            },
            '../footer': {
                'bing': 'bong'
            }
        });

        extend({
            '>>header': {
                'file': 'header'
            },
            'content': {
                '>>footer': {
                    'file': 'footer'
                }
            }
        }, options, function (err, json) {
            json.should.deep.equal({
                'header': {
                    'foo': 'bar'
                },
                'content': {
                    'footer': {
                        'bing': 'bong'
                    }
                }
            });

            done();
        });
    });

    it('should recursively populate JSON files and functions', function (done) {
        var extend = proxyquire('../index', {
            '../header': {
                'foo': 'bar'
            },
            '../footer': function (key, name, parent) {
                parent[name] = ['1234', '56789'];
            }
        });

        extend({
            '>>header': {
                'file': 'header'
            },
            'content': {
                '>>footer': {
                    'function': 'footer'
                }
            }
        }, options, function (err, json) {
            json.should.deep.equal({
                'header': {
                    'foo': 'bar'
                },
                'content': {
                    'footer': ['1234', '56789']
                }
            });

            done();
        });
    });

    it('should accept options to set a custom pointer', function (done) {
        extend({
            "**header": {
                "file": "header"
            }
        }, {
            path: '../',
            pointer: '**'
        }, function (err, json) {
            json.should.deep.equal({
                'header': {
                    'foo': 'bar'
                }
            });

            done();
        });
    });

    it('should only iterate on valid objects, not null or undefined values', function(done) {
        extend({
            "header": null,
            "footer": undefined
        }, {
            path: '../',
            pointer: '**'
        }, function (err, json) {
            json.should.deep.equal({
                'header': null,
                'footer': undefined
            });

            done();
        });
    });

    it('should normalize all user provided paths', function (done) {
        extend({
            '>>header': {
                'file': 'header'
            },
            'content': {
                'hello': 'world'
            }
        }, {
            path: '..',
            pointer: '>>'
        }, function (err, json) {
            should.not.exist(err);
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
});