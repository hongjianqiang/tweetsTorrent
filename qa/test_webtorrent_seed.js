(function() {
  'use strict';

  var logger      = require('../my_modules/logHelper.js');
  var helper      = require('../my_modules/helper.js');
  var WebTorrent  = require('webtorrent-hybrid');
  var path        = require('path');

  var opts = {
    tracker: {
      rtcConfig: {
        'iceServers': [
          { 'url': 'stun:23.21.150.121', 'urls': 'stun:23.21.150.121' }
        ]
      },
      announce: [
        'wss://tracker.btorrent.xyz',
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.fastcast.nz',
        'ws://localhost:8000'
      ]
    }
  };

  var client = new WebTorrent(opts);

  logger.look(client);

  client.seed(path.join(__dirname, './test.js'), function(torrent) {
    logger.look(torrent.infoHash);
    logger.look(torrent.magnetURI);
  });
})();
