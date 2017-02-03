(function() {
  'use strict';

  var common = require('./common.js');
  var helper = require('./helper.js');

  /**
   * 登录授权
   */
  module.exports = function(req, res, next) {
    if (isExclude(req.path)) {
      next();
    } else {
      if (req.session && req.session.keyPair) {
        next();
      } else {
        res.redirect('/account/login?redirect='+req.originalUrl);
      }
    }

    /**
     * 判断是否为排除的页面
     *
     * @method isExclude
     * @param {String} url 表示url地址
     * @return {Boolean} 排除的页面为true
     */
    function isExclude(url) {
      var len  = common.EXCLUDE.length;

      for (var i = 0; i < len; i++) {
        if (url.toLowerCase().indexOf(common.EXCLUDE[i]) >= 0) {
          return true;
        }
      }

      return false;
    }
  };
})();
