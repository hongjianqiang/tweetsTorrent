(function() {
  'use strict';

  var logger      = require('../my_modules/logHelper.js');
  var helper      = require('../my_modules/helper.js');
  var WebTorrent  = require('webtorrent-hybrid');
  var path        = require('path');

  var webtorrentModel = {
    rtcConfig: {
      'iceServers': [
        { 'url': 'stun:23.21.150.121', 'urls': 'stun:23.21.150.121' }
      ]
    },
    trackers: [
      'wss://tracker.btorrent.xyz',
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.fastcast.nz',
      'ws://localhost:8000',
      'udp://localhost:8000'
    ],
    opts: {
      announce: null
    },
    socket: null,
    client: null,
    seed: function(input, eventName) {
      var self = this;

      var basename = path.basename(input);

      self.opts.name = basename;
      self.client.seed(input, self.opts, function(torrent) {
        var torrentInfo = {};

        torrentInfo.infoHash  = torrent.infoHash;
        torrentInfo.magnetURI = torrent.magnetURI;
        torrentInfo.numPeers  = torrent.numPeers;

        logger.look(torrentInfo);
        var tmp = self.socket && self.socket.emit(eventName, torrentInfo);
      });

      delete self.opts.name;
    },
    _bindEvent: function(io) {
      var self = this;

      io.on('connection', function(socket) {
        self.socket = socket;
      });
    },
    init: function(io) {
      var self = this;

      self.opts.announce = self.trackers;

      self.client = new WebTorrent({
        tracker: {
          rtcConfig: self.rtcConfig,
          announce: self.trackers
        }
      });
      self._bindEvent(io);
    }
  };
  module.exports = webtorrentModel;
})();
