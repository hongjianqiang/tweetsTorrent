(function() {
  'use strict';

  var logger      = require('../my_modules/logHelper.js');
  var helper      = require('../my_modules/helper.js');
  var dhtModel    = require('../models/dhtModel.js');
  var edModel     = require('../models/edModel.js');
  var formidable  = require('formidable');
  var express     = require('express');
  var moment      = require('moment');
  var path        = require('path');
  var router      = express.Router();

  router.get('/api/ed25519-supercop/createSeed', function(req, res, next) {
    res.json(edModel.createSeed());
  });

  router.get('/api/ed25519-supercop/createKeyPair', function(req, res, next) {
    res.json(edModel.createKeyPair(req.query.seed));
  });

  router.get('/api/ed25519-supercop/sign', function(req, res, next) {
    res.json(
      edModel.sign(
        req.query.message,
        req.query.publicKey,
        req.query.secretKey
      )
    );
  });

  router.get('/api/ed25519-supercop/verify', function(req, res, next) {
    res.json(
      edModel.verify(
        req.query.signature,
        req.query.message,
        req.query.publicKey
      )
    );
  });

  router.get('/api/bittorrent-dht/dhtReady', function(req, res, next) {
    res.json(dhtModel.dhtIsReady('/api/bittorrent-dht/dhtReady'));
  });

  router.get('/api/bittorrent-dht/addNodes', function(req, res, next) {
    res.json(dhtModel.addNodes(req.query.nodes));
  });

  router.get('/api/bittorrent-dht/getNodes', function(req, res, next) {
    res.json(dhtModel.getNodes());
  });

  router.get('/api/bittorrent-dht/put', function(req, res, next) {
    var data = {};

    data.text = req.query.torrentId;
    data.publicKey = req.session.keyPair.publicKey;
    data.secretKey = req.session.keyPair.secretKey;

    res.json(dhtModel.put(data, '/api/bittorrent-dht/put/result'));
  });

  router.post('/api/bittorrent-dht/regist', function(req, res, next) {
    req.body.text = req.body.text || 'Hello，我加入tweetsTorrent了！ :)';

    res.json(dhtModel.put(req.body, '/api/bittorrent-dht/regist'));
  });

  router.post('/api/sendTweets', function(req, res, next) {
    var t = moment().format('YYYYMMDDHHmmss');
    var form = new formidable.IncomingForm();

    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname, '..', 'public', 'tweets', req.session.keyPair.uid, t);
    form.keepExtensions = true;
    form.hash = 'sha1';

    helper.checkAndCreateDir(form.uploadDir);
    form.parse(req, function(err, fields, files) {
      // if(err) return res.redirect(303, '/error');

      if (fields.text || !helper.objectIsEmpty(files)) {
        dhtModel.releaseTweet(fields, files, '/api/sendTweets/result', form.uploadDir);
        res.json({success: true});
      } else {
        res.json({success: false});
      }
    });
  });

  router.get('/api/getTweets', function(req, res, next) {
    
  });

  module.exports = router;
})();
