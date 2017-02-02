(function() {
  'use strict';

  var templateHelper = {
    extHelper: function(template) {

      template.helper('JSON_stringify', function(obj) {
        return JSON.stringify(obj);
      });

      template.helper('JSON_parse', function(json) {
        return JSON.parse(json);
      });

      template.helper('time', function(fmt) {
        fmt = fmt || 'YYYY-MM-DD hh:mm:ss';
        return moment().format(fmt);
      });

    }
  };
  module.exports = templateHelper;
})();
