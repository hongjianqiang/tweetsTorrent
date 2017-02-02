(function() {
  'use strict';

  var request = require('request');

  request('http://127.0.0.1:2017/api/ed25519-supercop/createSeed', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log('+++++++++++++++++++++++++++++++++');
      // console.log(body);
      // console.log('+++++++++++++++++++++++++++++++++');
    }
  });

  var opts = {
    url: 'http://127.0.0.1:2017/api/ed25519-supercop/createKeyPair',
    seed: [49,124,29,162,129,249,182,198,49,245,125,31,127,173,60,22,81,40,158,157,155,135,208,196,239,85,146,20,19,89,1,26]
  };

  request.get('http://127.0.0.1:2017/api/ed25519-supercop/createKeyPair?seed=[49,124,29,162,129,249,182,198,49,245,125,31,127,173,60,22,81,40,158,157,155,135,208,196,239,85,146,20,19,89,1,26]', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log('+++++++++++++++++++++++++++++++++');
      // console.log(JSON.parse(body));
      // console.log('+++++++++++++++++++++++++++++++++');
    }
  });

  var combineUrlParams = function(opts) {
    var url = '';

    for (var k in opts) {
      if ('url' === k) {
        url = opts[k] + '?' + url;
      } else {
        var str = '';
        if ('string' === typeof(opts[k])) str = opts[k];
        if ('string' !== typeof(opts[k])) str = JSON.stringify(opts[k]);

        url = url + k + '=' + str + '&';
      }
    }

    return url.slice(0, url.length-1);
  };

  opts = {
    url: 'http://127.0.0.1:2017/api/ed25519-supercop/createKeyPair',
    seed: [49,124,29,162,129,249,182,198,49,245,125,31,127,173,60,22,81,40,158,157,155,135,208,196,239,85,146,20,19,89,1,26],
    hello: 'world',
    keyPair: {
      publicKey: [1,2,3],
      secretKey: [5,6,7,8,9]
    }
  };
  console.log(combineUrlParams(opts));

})();
