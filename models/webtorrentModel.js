(function() {
  'use strict';

  var logger      = require('../my_modules/logHelper.js');
  var helper      = require('../my_modules/helper.js');
  var WebTorrent  = require('webtorrent-hybrid');
  var path        = require('path');
  var fs          = require('fs');

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
    allTweetsFolder: [],
    updateLocateLatestHash: function(infoHash, basename) {
      var self = this;
      var config = {};
      var configPath = path.join(basename, '..', 'config.json');

      if (fs.existsSync(configPath)) {
        var data = fs.readFileSync(configPath, 'utf-8').toString();

        try {
          config = JSON.parse(data);
        } catch(e){
          console.log('%s 解析JSON错误，已删除重建', configPath);
          fs.unlinkSync(configPath);
          self.updateLocateLatestHash(infoHash, basename);
        }  
      } else {
        config.latest = [];
      }

      var i = 0;
      for(i=0; i<config.latest.length; i++){
        if(infoHash === config.latest[i]) break;
      }

      if(i >= config.latest.length){
        config.latest.unshift(infoHash);
        fs.writeFile(configPath,
          JSON.stringify(config),
          function(err){
          });   
      }   
    },
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
        self.updateLocateLatestHash(torrentInfo.infoHash, input);
        var tmp = self.socket && self.socket.emit(eventName, torrentInfo);
      });

      delete self.opts.name;
    },
    listAllTweetsFolder: function(baseFolder) {
      var list = [];

      baseFolder = baseFolder || path.join(__dirname, '..', 'public', 'tweets');

      fs.readdirSync(baseFolder).forEach(function(name){
        if(name.indexOf('.')<0){
          var items = path.join(baseFolder, name);

          fs.readdirSync(items).forEach(function(item){
            if(item.indexOf('.')<0){
              list.push(path.join(items, item));
            }
          });
        }
      });
      
      return list;
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

      self.allTweetsFolder = self.listAllTweetsFolder();
      self.allTweetsFolder.forEach(function(item){
        self.seed(item, '');
      });
    }
  };
  module.exports = webtorrentModel;
})();
