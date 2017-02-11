(function() {
  'use strict';

  var logger      = require('../my_modules/logHelper.js');
  var helper      = require('../my_modules/helper.js');
  var webtorrent  = require('./webtorrentModel.js');
  var ed          = require('ed25519-supercop');
  var DHT         = require('bittorrent-dht');
  var crypto      = require('crypto');
  var moment      = require('moment');
  var path        = require('path');
  var fs          = require('fs');

  var dhtModel = {
    socket: null,
    opts: {
      verify: ed.verify
    },
    dht: null,
    dhtReady: false,
    nodesFile: path.join(__dirname, 'config', 'nodes.json'),
    releaseTweet: function(fields, files, eventName, uploadDir) {
      var self    = this;
      var ext     = '';
      var dirname = '';
      var hash    = '';
      var tweet   = {
        prevTweets: new Array(3),
        timestamp: new Date().getTime(),
        text: '',
        imgs: new Array(9),
        video: new Array(9),
        files: new Array(9)
      };

      tweet.text = fields.text;
      logger.look(tweet);

      for (var key in files) {
        hash    = files[key].hash;
        ext     = path.extname(files[key].path);
        dirname = path.dirname(files[key].path);

        if (!fs.existsSync(dirname+hash+ext)) {
          fs.renameSync(files[key].path, path.join(dirname, hash+ext));  //重命名
        }
        if (fs.existsSync(files[key].path)) {
          fs.unlinkSync(files[key].path);
        }

        if (files[key].type.indexOf('image')>-1) {
          tweet.imgs[parseInt(key)] = hash+ext;
        }
        if (files[key].type.indexOf('video')>-1) {
          tweet.video[parseInt(key)] = hash+ext;
        }
        if (files[key].type.indexOf('application')>-1) {
          tweet.files[parseInt(key)] = hash+ext;
        }
      }

      var config;
      var configPath = path.join(uploadDir, '..', 'config.json');
      if (fs.existsSync(configPath)) {
        var data = fs.readFileSync(configPath, 'utf-8').toString();

        try {
          config = JSON.parse(data);
        } catch(e){
          console.log('%s 解析JSON错误，已删除重建', configPath);
          fs.unlink(configPath);
        }

        for (var i=0; i<tweet.prevTweets.length; i++) {
          if (i<config.latest.length)
            tweet.prevTweets[i] = config.latest[i];
        }
      }

      fs.writeFile(path.join(uploadDir, 'tweet.json'),
        JSON.stringify(tweet),
        function(err) {
          if (err) throw err;
          webtorrent.seed(path.join(uploadDir), eventName);
        });
    },
    addNodesFromFiles: function(pathname) {
      var self = this;
      pathname = pathname || self.nodesFile;

      var isExists = fs.existsSync(pathname);

      if (isExists) {
        var data = fs.readFileSync(pathname, 'utf-8').toString();
        var nodes;

        try {
          nodes = JSON.parse(data);

          nodes.forEach(function(node) {
            self.dht.addNode(node);
          });
          console.log('节点添加完成');
        } catch(e){
          console.log('%s 解析JSON错误，已删除重建', pathname);
          fs.unlink(pathname);
        }

        return true;

      } else {

        console.log('%s 节点文件不存在，10分钟后创建', pathname);
        return false;

      }
    },
    dhtIsReady: function(eventName) {
      var self = this;
      var tmp = self.socket && self.socket.emit(eventName, self.dhtReady);

      return {dhtReady: self.dhtReady, success: true};
    },
    addNodes: function(nodes) {
      var self = this;

      try {
        var n = JSON.parse(nodes);
        n.forEach(function(node) {
          self.dht.addNode(node);
        });
        return {success: true};
      } catch(e){
        return {success: false};
      }
    },
    getNodes: function() {
      var self = this;

      var results = {};
      results.nodes = self.dht.toJSON().nodes;
      results.success = true;

      return results;
    },
    put: function(data, eventName) {
      var self      = this;
      var value, publicKey, secretKey;

      try{
        value     = Buffer.from(data.text);
        publicKey = Buffer.from(data.publicKey);
        secretKey = Buffer.from(data.secretKey);
      } catch(e) {
        console.log('类型错误：Buffer.from()的第一个参数必须为字符、Buffer或数组类型');
        return {success: false};
      }

      var opts = {
        k: publicKey,
        seq: new Date().getTime(),
        v: value,
        sign: function(buf) {
          return ed.sign(buf, publicKey, secretKey);
        }
      };

      try{
        self.dht.put(opts, function(err, hash) {
          logger.look(err);
          logger.look(hash);
          var results = {};

          results.uid = hash.toString('hex');
          results.uidOrigin = hash.toJSON().data;
          results.text = data.text;
          results.announce = true;
          if (err) results.announce = false;

          var tmp = self.socket && self.socket.emit(eventName, results);
        });
      } catch(e) {
        return {success: false};
      }

      return {success: true};
    },
    _bindEvent: function(io) {
      var self = this;

      io.on('connection', function(socket) {
        self.socket = socket;
      });

      setInterval(function() {
        var nodes = self.dht.toJSON().nodes;

        fs.writeFile(self.nodesFile,
          JSON.stringify(nodes),
          function(err) {
            if (err) throw err;
            console.log('更新节点到 %s', self.nodesFile);
          });
      }, 600*1000);

      if(!fs.existsSync(self.nodesFile)) {
        // 没有节点文件(没有添加到节点)时，启动DHT监听服务
        try {
          self.dht.listen(function() {
            console.log('DHT 服务已开始监听');
          });
        } catch(e) {
          console.log('DHT 服务监听失败');
        }
      }

      self.dht.on('ready', function() {
        console.log('DHT 服务初始化完成');
        self.dhtReady = true;

        var tmp = self.socket && self.socket.emit('dhtReady', self.dhtReady);
      });
    },
    init: function(io) {
      var self = this;

      self.dht = new DHT(self.opts);
      self.addNodesFromFiles();
      self._bindEvent(io);
    }
  };
  module.exports = dhtModel;
})();
