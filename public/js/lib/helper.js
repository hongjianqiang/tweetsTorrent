(function() {
  'use strict';

  var helper = {
    /**
     * 从url地址栏中获取指定参数值
     *
     * @method getUrlParamUTF8
     * @param {String} str 表示需要获取的URL参数
     * @return {String} 返回参数值
     */
    getUrlParamUTF8: function(param) {
      var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r !== null) return decodeURI(r[2]); return null;
    },

    /**
     * 获取指定窗口中顶层的窗口
     *
     * @method getTopWindow
     * @param {Object} w 指定的窗口
     * @return {Object} 顶层的窗口
     */
    getTopWindow: function(w) {
      var self = this;

      if(w.parent == w){
        return w;
      }
      return self.getTopWindow(w.parent);
    },

    /**
     * 把参数加入URL地址
     *
     * @method formatURL
     * @param {String} url 表示URL地址
     * @param {Object} args 表示需要加入的参数
     */
    formatURL: function(url, args) {
      var self = this;

      if(args){
        var sharp = '';
        var split = url.split('#');

        if(split.length == 2){
          url = split[0];
          sharp = '#' + split[1];
        }

        for(var key in args){
          if(url.indexOf('?') > 0){
            url += '&' + key + '=' + args[key];
          } else {
            url += '?' + key + '=' + args[key];
          }
        }
        url += sharp;
      }

      return url;
    },

    /**
     * 跳转到指定的URL地址
     *
     * @method action
     * @param {String} url 表示URL地址
     * @param {Object} args 表示URL地址参数
     */
    action: function(url, args) {
      var self = this;

      url = self.formatURL(url, args);
      self.getTopWindow(window).location.href = url;
    },

    /**
     * 把类似'[1,2,3,4,5]'的字符串转化为数组[1,2,3,4]
     *
     * @method strToIntArray
     * @param {String} str 表示需要转化的字符串
     * @return {Array} 返回一个十进制数值数组
     */
    strToIntArray: function(str) {
      var arr = str.replace('[', '').replace(']', '').split(',');

      return arr.map(function(element) {
        return parseInt(element, 10);
      });
    },

    /**
     * 判断是否为数组
     *
     * @method isArray
     * @param {Object} obj 表示传入一个对象
     * @return {Boolean} 数组返回为true
     */
    isArray: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },

    /**
     * 判断是否为对象
     *
     * @method isObject
     * @param {Object} obj 表示传入一个对象
     * @return {Boolean} 对象返回为true
     */
    isObject: function(obj) {
      return Object.prototype.toString.call(obj) === '[object Object]';
    },

    /**
     * 判断对象是否为空
     *
     * @method objectIsEmpty
     * @param {Object} obj 表示传入一个对象{}
     * @return {Boolean} 否返回为false
     */
    objectIsEmpty: function(obj) {
      if (null === obj) return true;
      if (undefined === obj) return true;

      var json = JSON.stringify(obj);

      if('{}' === json || json === '[]' || json === '""') return true;
      return false;
    }
  };

  window.helper = helper;
})();
