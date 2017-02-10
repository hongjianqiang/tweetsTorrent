(function() {
  'use strict';

  var logger      = require('../my_modules/logHelper.js');
  var helper      = require('../my_modules/helper.js');
  var WebTorrent  = require('webtorrent-hybrid');
  var path        = require('path');

  var rtcConfig = {
    'iceServers': [
      { 'url': 'stun:23.21.150.121', 'urls': 'stun:23.21.150.121' }
    ]
  };

  var trackers = [
    'wss://tracker.btorrent.xyz',
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.fastcast.nz',
    'ws://localhost:8000',
    'udp://localhost:8000'
  ];

  var opts = {
    announce: trackers
  };

  var client = new WebTorrent({
    tracker: {
      rtcConfig: rtcConfig,
      announce: trackers
    }
  });

  // var magnetURI = 'magnet:?xt=urn:btih:0b2ed55b979653503b1ad82b3b20eb1aeccdb85f&dn=%E6%88%AA%E5%9B%BE2.png&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';

  // var magnetURI = 'd537c144e70de6e30c9a51ea2159eb1d85ff7074';
  var magnetURI = 'f0af860ed134e2db4d05d4a736779e8ecf0f7775';
  // var magnetURI = 'magnet:?xt=urn:btih:d537c144e70de6e30c9a51ea2159eb1d85ff7074&dn=20170201233516&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';

  // var magnetURI = 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fzer0day.ch%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';

  console.log(path.join(__dirname, 'download'));

  opts.path = path.join(__dirname, 'download');
  client.add(magnetURI, opts,
    function (torrent) {
      torrent.on('done', function() {
        console.log('torrent download finished');
      });
    });

  setInterval(function(){
    if(client.progress)
      console.log(client.progress);
  }, 5*1000);
})();
