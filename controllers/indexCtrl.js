(function() {
  'use strict';

  var logger    = require('../my_modules/logHelper.js');
  var common    = require('../my_modules/common.js');
  var express   = require('express');
  var router    = express.Router();

  router.get('/', function(req, res, next) {
    res.redirect('/index');
  });

  router.get('/index', function(req, res, next) {
    var api = [];

    var attach = {
      isLogin: req.session.keyPair
    };

    var resource = [
      '/public/css/notie.min.css',
      '/public/css/common.css',
      '/public/js/lib/socket.io.min.js',
      '/public/js/lib/notie.min.js',
      '/public/js/partials/sendTweets.js'
    ];

    common.dataFactory(req, res, api, attach, function(err, data) {
      res.render('./index.html', data, function(err, html) {
        res.send(common.addResource(html, resource));
      });
    });
  });

  module.exports = router;
})();
