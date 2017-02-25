(function() {
  'use strict';

  var Data = {
    msg: '请把密钥文件拖放到虚线框内',
    keyPair: null,
    password: null,
    classObj: {
      msg: {
        'animated': true,
        'shake': false
      }
    }
  };

  new Vue({
    el: '.js-login',
    data: Data,
    mounted: function() {
      var self = this;
      self.handleDragDropInit();
      self.handleDropbox();
    },
    methods: {
      handleDragDropInit: function() {
        var self = this;

        document.addEventListener('dragleave', function(e) {
          // 拖离
          e.preventDefault();
        }, false);
        document.addEventListener('drop', function(e) {
          // 拖放后
          e.preventDefault();
        }, false);
        document.addEventListener('dragenter', function(e) {
          // 拖进
          e.preventDefault();
        }, false);
        document.addEventListener('dragover', function(e) {
          // 拖来拖去
          e.preventDefault();
        }, false);
      },
      handleDropbox: function() {
        var self = this;
        var dropBox = document.getElementsByClassName('js-login__keyPair')[0];

        dropBox.addEventListener('drop', function(e){
          var fileList = e.dataTransfer.files;

          if (0 === fileList.length) {
            return false;
          }

          var reader = new FileReader();
          reader.onload = function(e){
            var text = reader.result;

            self.keyPair = text;
            self.msg = '文件读取成功，请尝试登录';
            dropBox.className += ' bggrey51';
          };

          reader.readAsText(fileList[0]);
        });
      },
      method_login: function(e) {
        var self = this;

        if (!self.keyPair) {
          self.method_shake(self.classObj.msg);
          return false;
        }

        if (self.password) {
          try {
            self.keyPair = CryptoJS.AES
              .decrypt(self.keyPair, self.password)
              .toString(CryptoJS.enc.Utf8);
            self.msg = '密钥文件解密成功！';

          } catch(err) {
            self.msg = '密钥文件解密错误！';
            self.method_shake(self.classObj.msg);
            return false;
          }
        }

        try {
          self.keyPair = JSON.parse(self.keyPair);
          self.msg = '密钥文件解析成功！';
        } catch(err) {
          self.msg = '请尝试输入密码';
          self.method_shake(self.classObj.msg);
          return false;
        }

        if (self.keyPair.nodes.length) {
          axios.get('/api/bittorrent-dht/addNodes', {
              params: {
                nodes: JSON.stringify(self.keyPair.nodes)
              }
            })
            .then(function(resp) {
              if (resp.data.success) {
                console.log('节点添加成功');
              } else {
                console.log('节点添加失败');
              }
            });
        }
        self.method_submit();
      },
      method_submit: function(e){
        var self = this;

        axios.post('/account/login', {
          fullName    : self.keyPair.fullName,
          email       : self.keyPair.email,
          publicKey   : self.keyPair.publicKey,
          secretKey   : self.keyPair.secretKey,
          uid         : self.keyPair.uid,
          uidOrigin   : self.keyPair.uidOrigin
        }).then(function(resp) {
          self.msg = resp.data.message;
          var url = helper.getUrlParamUTF8('redirect');

          if (resp.data.success) {
            if (url) {
              helper.action(url, {uid: self.keyPair.uid});
            } else {
              helper.action('/index', {uid: self.keyPair.uid});
            }
          }
        }).catch(function(err) {
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

  window.Data = Data;
})();
