(function() {
  'use strict';

  var Data = {
    registName: '准备中...',
    seed: [],
    publicKey: [],
    secretKey: [],
    fullName: null,
    email: null,
    password: null,
    nodes: [],
    classObj: {
      fullName: {
        'animated': true,
        'shake': false
      },
      email: {
        'animated': true,
        'shake': false
      },
      regist: {
        'disabled': true
      }
    },
    statusBoolean: {
      getKeyPairSuccess: false,
      registWaiting: false
    },
    fileData: 'data:text/txt;charset=utf-8,',
    fileName: 'KeyPair.json'
  };

  new Vue({
    el: '.js-regist',
    data: Data,
    mounted: function() {
      var self = this;

      self.seed = helper.strToIntArray(self.$el.getAttribute('data-seed'));
      self.publicKey = helper.strToIntArray(self.$el.getAttribute('data-publicKey'));
      self.secretKey = helper.strToIntArray(self.$el.getAttribute('data-secretKey'));

      setTimeout(function(){
        axios.get('/api/bittorrent-dht/dhtReady');
        axios.get('/api/bittorrent-dht/getNodes')
          .then(function(resp) {
            self.nodes = resp.data.nodes;
          });
      }, 0);
    },
    methods: {
      method_Regist: function(e) {
        var self = this;

        if (!self.fullName) {
          self.method_shake(self.classObj.fullName);
          return false;
        }
        if (!self.email) {
          self.method_shake(self.classObj.email);
          return false;
        }

        axios.post('/api/bittorrent-dht/regist', {
            text: 'Hello，我加入tweetsTorrent了！ :)',
            publicKey: self.publicKey,
            secretKey: self.secretKey
          }).then(function(resp) {
            self.statusBoolean.registWaiting = true;
            self.classObj.regist.disabled = true;
            console.log(resp.data);
          }, function(err) {
            console.log(err);
          });
      },
      method_shake: function(it) {
        it.shake = true;
        setTimeout(function() {
          it.shake = false;
        }, 1*1000);
      }
    }
  });

  var socket = io(window.location.origin);

  socket.on('/api/bittorrent-dht/dhtReady', function(data) {
    if (data) {
      Data.classObj.regist.disabled = false;
      Data.registName = '注册';
    }
  });

  socket.on('/api/bittorrent-dht/regist', function(data) {
    // data.uid;
    // data.uidOrigin;
    // data.announce;
    data.publicKey = Data.publicKey;
    data.secretKey = Data.secretKey;
    data.fullName  = Data.fullName;
    data.email     = Data.email;
    data.nodes     = Data.nodes;

    var text;
    if (Data.password) {
      text = CryptoJS.AES
        .encrypt(JSON.stringify(data), Data.password)
        .toString();
      Data.fileName += '.aes';
    } else {
      text = JSON.stringify(data);
    }

    Data.fileData = Data.fileData + text;
    Data.statusBoolean.getKeyPairSuccess = true;
  });

  window.Data = Data;
})();
