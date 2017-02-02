(function() {
  'use strict';

  var logger  = require('../my_modules/logHelper.js');
  var helper  = require('../my_modules/helper.js');
  var ed      = require('ed25519-supercop');

  var edModel = {
    createSeed: function() {
      var seed = {};
      var s = ed.createSeed();

      seed.success = true;
      seed.seed = s.toJSON().data;
      return seed;
    },
    createKeyPair: function(seed) {
      if(!seed) return {success: false};

      seed = helper.strToIntArray(seed);
      if (32 !== seed.length) return {success: false};

      var k, keyPair = {};
      seed = Buffer.from(seed);
      k    = ed.createKeyPair(seed);
      keyPair.publicKey = k.publicKey.toJSON().data;
      keyPair.secretKey = k.secretKey.toJSON().data;
      keyPair.success   = true;

      return keyPair;
    },
    sign: function(message, publicKey, secretKey) {
      if (!publicKey) return {success: false};
      if (!secretKey) return {success: false};

      message = message || '';
      publicKey = Buffer.from(helper.strToIntArray(publicKey));
      secretKey = Buffer.from(helper.strToIntArray(secretKey));

      try{
        var signature = {};
        var sign = ed.sign(message, publicKey, secretKey);

        signature.success = true;
        signature.signature = sign.toJSON().data;
        return signature;
      }catch(e){ return {success: false}; }
    },
    verify: function(signature, message, publicKey) {
      if (!signature) return {success: false};
      if (!publicKey) return {success: false};

      message = message || '';
      signature = Buffer.from(helper.strToIntArray(signature));
      publicKey = Buffer.from(helper.strToIntArray(publicKey));

      try{
        var ok = {};
        var result = ed.verify(signature, message, publicKey);

        ok.success  = true;
        ok.ok       = result;
        return ok;
      }catch(e){ return {success: false}; }
    },

    /**
     * 验证是否为密匙对
     *
     * @method isKeyPair
     * @param {Array} publicKey 表示公钥
     * @param {Array} secretKey 表示密钥
     * @return {Boolean} 验证成功返回true
     */
    isKeyPair: function(data) {
      var self = this;
      var publicKey, secretKey;
      var reg = /^[0-9a-zA-Z]*$/g;

      if (data.uid && !reg.test(data.uid)) return false;

      try{
        publicKey = Buffer.from(data.publicKey);
        secretKey = Buffer.from(data.secretKey);
      } catch(e) {
        return false;
      }

      var message = 'This is a piece of information that cannot be tampered with.';
      var sign    = ed.sign(message, publicKey, secretKey);
      var result  = ed.verify(sign, message, publicKey);

      return result;
    }
  };
  module.exports = edModel;
})();
