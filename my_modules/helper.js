(function() {
  'use strict';

  var logger    = require('../my_modules/logHelper.js');
  var path      = require('path');
  var net       = require('net');
  var fs        = require('fs');

  var helper = {
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
     * @return {Boolean} 是返回为true
     */
    objectIsEmpty: function(obj) {
      if (null === obj) return true;
      if (undefined === obj) return true;

      var json = JSON.stringify(obj);

      if('{}' === json || json === '[]' || json === '""') return true;
      return false;
    },

    /**
     * 生成指定范围的随机整数
     *
     * @method randomInt
     * @param {Number} min 设置生成随机数的最小值(包含)
     * @param {Number} max 设置生成随机数的最大值(不包含)
     * @param {Number} 返回一个指定范围的随机整数
     */
    randomInt: function(min, max) {
      min = min || 0;
      max = max || 10;
      return parseInt(Math.random()*(max-min) + min, 10);
    },

    /**
     * 获取一个未被占用的TCP端口号
     *
     * @method vacantTCPPort
     * @param {Function} callback 找到未被占用的端口号时回调
     */
    vacantTCPPort: function(callback) {
      var self = this;

      var port = self.randomInt(1025, 65535);
      var server = net.createServer().listen(port);

      server.on('listening', function() {
        // 端口未被占用
        server.close();
        if ('function' === typeof(callback)) callback(port);
      });

      server.on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
          // 端口已被占用
          self.vacantTCPPort(callback);
        }
      });
    },

    /**
     * 递归同步创建一个目录
     *
     * @method checkAndCreateDir
     * @param {String} dirpath 目录路径
     * @param {Integer} mode 目录权限
     * @retrun {Boolean} 创建完成为true
     */
    checkAndCreateDir: function(dirpath, mode) {
      var self = this;

      dirpath = path.normalize(dirpath);

      if (!fs.existsSync(dirpath)) {
        var pathtmp;

        dirpath.split(path.sep).forEach(function(dirname) {
          if (dirname) {
            if (pathtmp) {
              pathtmp = path.join(pathtmp, dirname);
            } else {
              pathtmp = dirname;
            }

            if (!fs.existsSync(pathtmp)) {
              if (!fs.mkdirSync(pathtmp, mode)) {
                return false;
              }
            }
          } else {
            if (!pathtmp) pathtmp = path.sep;
          }
        });
      }

      return true;
    }
  };

  module.exports = helper;
})();
