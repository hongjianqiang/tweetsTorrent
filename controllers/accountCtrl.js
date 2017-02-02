(function() {
  'use strict';

  var logger    = require('../my_modules/logHelper.js');
  var common    = require('../my_modules/common.js');
  var edModel   = require('../models/edModel.js');
  var express   = require('express');
  var router    = express.Router();

  router.get('/account/regist', function(req, res, next) {
    var api = [
      {
        name: 'seed',
        url: '/api/ed25519-supercop/createSeed',
        type: 'get',
        params: {},
        results: {
          seed: null
        }
      },
      {
        name: 'keyPair',
        url: '/api/ed25519-supercop/createKeyPair',
        type: 'get',
        params: {
          seed: 'seed'
        },
        results: {}
      }
    ];

    var attach = {
    };

    var resource = [
      '/public/css/animate.min.css',
      '/public/css/common.css',
      '/public/js/lib/socket.io.min.js',
      '/public/js/lib/crypto-js.js',
      '/public/js/account/regist.js'
    ];

    common.dataFactory(req, res, api, attach, function(err, data) {
      res.render('./account/regist.html', data, function(err, html) {
        res.send(common.addResource(html, resource));
      });
    });

  });

  router.get('/account/login', function(req, res, next) {
    var api = [];

    var attach = {};

    var resource = [
      '/public/css/animate.min.css',
      '/public/css/common.css',
      '/public/js/lib/crypto-js.js',
      '/public/js/account/login.js'
    ];

    if (req.query.logout) {
      req.session.keyPair = null;
    }

    common.dataFactory(req, res, api, attach, function(err, data) {
      res.render('./account/login.html', data, function(err, html) {
        res.send(common.addResource(html, resource));
      });
    });
  });

  router.post('/account/login', function(req, res, next) {
    var data = {};

    if (edModel.isKeyPair(req.body)) {
      req.session.keyPair = req.body;
      data.success = true;
      data.message = '密钥文件正确';
    } else {
      data.success = false;
      data.message = '密钥文件不正确';
    }

    res.json(data);
  });

  module.exports = router;
})();
