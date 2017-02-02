(function() {
  'use strict';

  var logger    = require('../my_modules/logHelper.js');
  var helper    = require('./helper.js');
  var request   = require('request');
  var path      = require('path');
  var fs        = require('fs');

  var common = {
    /**
     * 允许浏览器访问的IP，'0.0.0.0'表示所有地址段都可以访问
     *
     * @propery {String} HOST
     */
    HOST: '127.0.0.1',

    /**
     * 允许浏览器访问的端口
     *
     * @propery {Number} PORT
     */
    PORT: 2017,

    /**
     * 默认HTML布局文件
     *
     * @propery {String} LAYOUT
     */
    LAYOUT: '../views/layouts/main.html',

    /**
     * 以下路由路径表示在未登录状态下也不需要跳转到登录页面
     *
     * @property {Array} EXCLUDE
     */
    EXCLUDE: [
      '/account/login',
      '/account/regist',
      '/public',
      '/api'
    ],

    /**
     * 项目根目录的绝对路径
     *
     * @propery {String} BASEPATH
     */
    BASEPATH: path.join(__dirname, '..'),

    init: function(layout) {
      var self = this;

      self.LAYOUT = path.join(__dirname, self.LAYOUT);
      layout = layout || self.LAYOUT;

      self._layoutCache = fs.readFileSync(layout, 'utf-8');
    },

    /**
     * 规范化api中的url参数
     *
     * @method normalize
     * @param {Object} req 表示express()路由的req对象
     * @param {Array|Object} api 表示需要把api里面含有url的值规范化
     */
    normalize: function(req, api) {
      var self = this;

      if (helper.isArray(api)) {
        api.forEach(function(item) {
          if ('url' in item) {
            if (item.url.indexOf('http') < 0) {
              item.url =  req.protocol + '://localhost:' + common.PORT + item.url;
            }
          }
        });
      }

      if (helper.isObject(api)) {
        for (var k in api) {
          if ('url' in api[k]) {
            if (api[k].url.indexOf('http') < 0) {
              api[k].url =  req.protocol + '://localhost:' + self.common.PORT + api[k].url;
            }
          }
        }
      }
    },

    /**
     * 合并url参数
     *
     * @method combineUrlParams
     * @param {Object} opts 表示将opts对象的属性合并成url形式
     * @return {String} 返回合并好的url
     */
    combineUrlParams: function(opts) {
      var url = '';

      for (var k in opts) {
        if ('url' === k) {
          url = opts[k] + '?' + url;
        } else {
          var str = '';
          if ('string' === typeof(opts[k])) str = opts[k];
          if ('string' !== typeof(opts[k])) str = JSON.stringify(opts[k]);

          url = url + k + '=' + str + '&';
        }
      }

      return url.slice(0, url.length-1);
    },

    /**
     * 依次请求数组中的元素，上一个请求结果作为下一个请求参数
     *
     * @method requestWaterFall
     * @param {Object} arr 表示一个请求数组集合
     * @param {Number} counter 计数器，表示从第几个数组元素开始(请求)，一般设为0
     * @param {Function} callback 把error和arr传入回调函数
     */
    requestWaterFall: function(arr, counter, callback) {
      var self = this;

      if (counter < arr.length) {
        if (!arr[counter].hasOwnProperty('url')) {
          self.requestWaterFall(arr, ++counter, callback);
        }

        var k;
        var opts = {};

        opts.url = arr[counter].url;
        if(!helper.objectIsEmpty(arr[counter].params)) {
          for (k in arr[counter].params) {
            opts[k] = arr[counter].params[k];
          }
        }

        // 将上一个结果作为当前参数传入
        if (counter) {
          for (k in arr[counter].params) {
            opts[k] = arr[counter-1].results[opts[k]];
          }
        }

        request.get(self.combineUrlParams(opts), function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var obj = JSON.parse(body);
            for (var k in obj) {
              arr[counter].results[k] = obj[k];
            }
            self.requestWaterFall(arr, ++counter, callback);
          } else {
            if ('function' === typeof(callback)) callback(error, arr);
          }
        });
      } else {
        // 递归调用结束
        if ('function' === typeof(callback)) callback(null, arr);
      }
    },

    /**
     * 格式化数据结构
     *
     * @method dataFormat
     * @param {Array|Object} obj 表示dataFactory()通过请求api获得的数据
     * @param {Object} attach 表示自定义的附加数据
     * @return {Object} 返回格式化完成的数据
     */
    dataFormat: function(obj, attach) {
      var data = {};
      var k;

      if (helper.isArray(obj)) {
        // 如果obj是数组
        obj.forEach(function(item) {
          if (item.hasOwnProperty('name') && item.name && item.hasOwnProperty('results')) {
            data[item.name] = {};

            for (k in item.results) {
              data[item.name][k] = item.results[k];
            }
          }
        });
      }

      if (helper.isObject(obj)) {
        // 如果obj是对象
      }

      if (!helper.objectIsEmpty(attach)) {
        // 添加附加数据对象
        data.attach = attach;
      }
      return data;
    },

    /**
     * 根据所给的参数，生成数据
     *
     * @method dataFactory
     * @param {Object} req 表示express()路由的req对象
     * @param {Object} res 表示express()路由的res对象
     * @param {Object} api 表示需要请求的对象
     * @param {Object} attach 表示需要整合的附加对象
     * @param {Function} callback 回调函数，参数为err和data，分别代表错误和生成的数据
     */
    dataFactory: function(req, res, api, attach, callback) {
      var self = this;
      var data;

      self.normalize(req, api);
      if (helper.isArray(api)) {
        // 逐个请求api数组中的元素，上一个请求结果作为下一个请求参数
        self.requestWaterFall(api, 0, function(err, arr) {
          data = self.dataFormat(arr, attach);
          if ('function' === typeof(callback)) callback(err, data);
        });
      }
      if (helper.isObject(api)) {

      }
    },

    /**
     * 合并JS、CSS、视图到布局模板中
     *
     * @method addResource
     * @param {String} html 表示已渲染的视图
     * @param {Array} resource 表示JS、CSS资源
     * @param {String} layoutCache 自定义渲染后的布局
     * @retrun {String} 返回已经合并JS、CSS、视图的布局
     */
    addResource: function(html, resource, layoutCache) {
      var self = this;

      if ('' === layoutCache) return html;
      if (null === self._layoutCache) return html;

      if (!layoutCache) {
        layoutCache = self._layoutCache;
      }

      var out       = '';
      var mergeJS   = '';
      var mergeCSS  = '';

      for (var i in resource) {
        var suffix = resource[i].split('.').pop().toLowerCase();

        if ('js'  === suffix) {
          mergeJS += '<script src="'+resource[i]+'"></script>\n';
        }
        if ('css' === suffix) {
          mergeCSS+= '<link href="'+resource[i]+'" rel="stylesheet">\n';
        }
      }

      out = layoutCache.replace('__{JavaScriptResource}__', mergeJS);
      out = out.replace('__{CascadingStyleSheetsResource}__', mergeCSS);
      out = out.replace('__{content}__', html);

      return out;
    },

    /**
     * 装载目录下的所有路由文件，但不递归装载
     *
     * @method loadRoutes
     * @param {String} baseUrl 路由器安装在基础url的路径
     * @param {String} routesPath 路由文件所在的目录
     * @param {Object} app 表示express()对象
     */
    loadRoutes: function(baseUrl, routesPath, app) {
      var files = fs.readdirSync(routesPath);

      for (var i = 0; i < files.length; i++) {
        var file = files[i];

        if (file.indexOf('.') === 0) {
          continue;
        }

        var router = require(path.join(routesPath, file));
        console.log('加载路由：' + path.join(routesPath, file));

        app.use(baseUrl, router);
      }
    },

    /**
     * 读取布局文件到内存，减少访问磁盘所花费的时间
     */
    _layoutCache: null,
  };

  module.exports = common;
})();
