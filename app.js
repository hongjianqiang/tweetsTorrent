(function() {
  'use strict';

  var template        = require('art-template/node/template-native.js');
  var templateHelper  = require('./my_modules/templateHelper');
  var logger          = require('./my_modules/logHelper.js');
  var auth            = require('./my_modules/auth.js');
  var common          = require('./my_modules/common.js');
  var webtorrentModel = require('./models/webtorrentModel.js');
  var dhtModel        = require('./models/dhtModel.js');
  var ed              = require('ed25519-supercop');
  var session         = require('express-session');
  var bodyParser      = require('body-parser');
  var socketIO        = require('socket.io');
  var express         = require('express');
  var http            = require('http');
  var path            = require('path');

  var app       = express();
  var server    = http.Server(app);
  var io        = socketIO(server);
  var randomStr = ed.createSeed().toString('hex');

  logger.init(path.join(__dirname, 'logs'));
  dhtModel.init(io);
  webtorrentModel.init(io);

  /**
   * 配置 art-Template 模板引擎。
   */
  template.config('extname', '.html');
  template.config('encoding', 'utf-8');
  template.config('cache', false);
  template.config('compress', false);
  templateHelper.extHelper(template);

  app.engine('html', template.__express);
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, 'views'));

  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: randomStr
  }));
  app.use(auth);
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  common.init();
  common.loadRoutes('/', path.join(__dirname, 'controllers'), app);

  server.listen(common.PORT, common.HOST, function() {
    console.log('Listening at http://%s:%s/',
      common.HOST, common.PORT);
  });
})();
