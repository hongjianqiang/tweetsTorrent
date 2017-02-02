(function() {
  'use strict';

  var helper = require('../my_modules/helper.js');

  var api1 = [
    {
      name: 'seed',
      url: '/api/ed25519-supercop/createSeed',
      type: 'get',
      params: null,
      results: {
        seed: 'seed'
      }
    },
    {
      name: 'keyPair',
      url: '/api/ed25519-supercop/createKeyPair',
      type: 'get',
      params: {
        seed: 'seed'
      },
      results: null
    }
  ];

  var api2 = {
    seed: {
      url: '/api/ed25519-supercop/createSeed',
      type: 'get',
      params: null,
      results: {
        seed: 'seed'
      }
    },
    keyPair: {
      url: 'https://www.baidu.com/api/ed25519-supercop/createKeyPair',
      type: 'get',
      params: {
        seed: 'seed'
      },
      results: null
    }
  };

  var req = {};
  req.protocol = 'http';

  var common = {};
  common.PORT = 2017;

  function normalize(api) {
    if (helper.isArray(api)) {
      api.forEach(function(item) {
        if ('url' in item) {
          if (item.url.indexOf('http') < 0) {
            item.url =  req.protocol + '://localhost:' + common.PORT + item.url;
          }
        }
      });
    }

    if (helper.isObject(api)) {
      for (var k in api) {
        if ('url' in api[k]) {
          if (api[k].url.indexOf('http') < 0) {
            api[k].url =  req.protocol + '://localhost:' + common.PORT + api[k].url;
          }
        }
      }
    }
  }

  normalize(api1);
  console.log(api1);
  console.log('+++++++++++++++++++++++++++++++++++++++++');

  normalize(api2);
  console.log(api2);
})();
