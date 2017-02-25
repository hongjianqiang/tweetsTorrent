(function(){
  'use strict';

  var logger  = require('../my_modules/logHelper.js');
  var ed      = require('ed25519-supercop');
  var DHT     = require('bittorrent-dht');
  // var bencode = require( 'bencode' );

  var dht = new DHT({ verify: ed.verify });

  var key = 'a68765657fe39fe7632a9ca23352fe2bb1e84f89';

  get(key);

  var i = 1;
  function get(key) {
    dht.get(key, function(err, res) {
      console.log('第 %d 次调用get()', i++);
      // logger.look(err);
      // logger.look(res);

      if(!err && res){
        logger.look({id: res.id.toString('hex')}); // 等价于上面的 key 变量
        logger.look({k: res.k.toJSON()}); // 公钥
        logger.look({nodes: res.nodes.toString('hex')});
        logger.look({seq: res.seq});
        logger.look({sig: res.sig.toString('hex')}); // 签名
        logger.look({token: res.token.toString('hex')});
        logger.look({v: res.v.toString()}); // 存储在DHT网络里的值

        // logger.look(bencode.decode(res.nodes, 'utf8'));

        dht.put(res, function () {
          // re-added the key/value pair
        });
      }

      if(!err && !res){
        setTimeout(function(){
          get(key);
        }, 3*1000);
      }
    });
  }
})();