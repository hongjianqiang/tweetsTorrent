(function() {
  'use strict';

  var log4js = require('log4js');
  var fs = require('fs');
  var path = require('path');

  var helper = {
    config: {
      "customBaseDir": path.join(__dirname, 'logs'),
      "customDefaultAtt": {
        "type": "file",
        "maxLogSize": 1*1024*1000,
        "backups": 10,
        "absolute": true
      },
      "appenders": [
        {"type": "console", "category": "console"},
        {"filename": "debug/debug.log", "category": "logDebug"},
        {"filename": "info/info.log", "category": "logInfo"},
        {"filename": "warn/warn.log", "category": "logWarn"},
        {"filename": "error/error.log", "category": "logErr"}
      ],
      "replaceConsole": true,
      "levels":{
        "logDebug": "DEBUG",
        "logInfo": "DEBUG",
        "logWarn": "DEBUG",
        "logErr": "DEBUG"
      }
    },
    _logDebug: log4js.getLogger('logDebug'),
    _logInfo: log4js.getLogger('logInfo'),
    _logWarn: log4js.getLogger('logWarn'),
    _logErr: log4js.getLogger('logErr'),
    init: function(baseDir) {
      var self = this;

      // 检查配置文件所需的目录是否存在，不存在时创建
      if(self.config.appenders){
        var defaultAtt = self.config.customDefaultAtt;

        baseDir = baseDir || self.config.customBaseDir;
        self.checkAndCreateDir(baseDir);

        for(var i = 0, j = self.config.appenders.length; i < j; i++){
          if('console' === self.config.appenders[i].type) continue;

          if(defaultAtt){
            for(var att in defaultAtt){
              if(!self.config.appenders[i][att])
                self.config.appenders[i][att] = defaultAtt[att];
            }
          }

          if(self.config.appenders[i].filename) {
            self.config.appenders[i].filename = path.join(baseDir, self.config.appenders[i].filename);
          } else {
            self.config.appenders[i].filename = path.join(baseDir, 'logs.log');
          }

          var dir = path.dirname(self.config.appenders[i].filename);
          self.checkAndCreateDir(dir);
        }
      }

      // 目录创建完毕，才加载配置，不然会出异常
      log4js.configure(self.config);
    },
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
    },
    look: function(msg) {
      console.log('\n+++++++++++++++++++++++++++++++++++\n',
        msg, '\n+++++++++++++++++++++++++++++++++++');
    },
    debug: function(msg) {
      var self = this;
      if(null === msg) msg = '';
      self._logDebug.debug(msg);
    },
    info: function(msg) {
      var self = this;
      if(null === msg) msg = '';
      self._logInfo.info(msg);
    },
    warn: function(msg) {
      var self = this;
      if(null === msg) msg = '';
      self._logWarn.warn(msg);
    },
    error: function(msg, exp) {
      var self = this;
      if(null === msg) msg = '';

      if (exp) {
        msg += '\r\n' + exp;
      }

      self._logErr.error(msg);
    }
  };
  module.exports = helper;
})();
