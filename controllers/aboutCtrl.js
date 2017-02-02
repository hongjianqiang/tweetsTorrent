(function() {
  'use strict';

  var express   = require('express');
  var common    = require('../my_modules/common.js');
  var router    = express.Router();

  router.get('/about/about.html', function(req, res, next) {
    res.send(common._layoutCache);
  });

  module.exports = router;
})();
