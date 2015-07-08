var yalt = {
  add: function(codes, dict, domain, isFallback) {
    codes = [].concat(codes);

    if (!domain)
      domain = '_global';

    if (!yalt.dicts[domain]) {
      yalt.dicts[domain] = {};
      Object.defineProperty(yalt.dicts[domain], '_fallback', { writable: true });
    }

    codes.forEach(function(code) {
      if (!yalt.dicts[domain][code])
        yalt.dicts[domain][code] = {};

      for (var p in dict)
        yalt.dicts[domain][code][p] = dict[p];
    });

    if (isFallback)
      yalt.dicts[domain]._fallback = codes[0];
  },

  get: function(code, domain) {
    if (!domain)
      domain = '_global';

    function gettext(msg) {
      var params = Array.prototype.slice.call(arguments, 1);

      for (var i = 0; i < gettext.fallbacks.length; i++) {
        var dict = gettext.fallbacks[i];
        if (dict[msg])
          return dict[msg].constructor == String ? vsprintf(dict[msg], params) : dict[msg].apply(dict, params);
      }

      return msg;
    }

    gettext.set = function(code) {
      gettext.code = code;

      if (!yalt.dicts[domain] || !yalt.dicts[domain][code])
        yalt.add(code, {}, domain);

      gettext.dict = yalt.dicts[domain][code];
      gettext.fallbacks = [gettext.dict];

      var fallback = yalt.dicts[domain]._fallback;
      if (fallback && code != fallback)
        gettext.fallbacks.push(yalt.dicts[domain][fallback]);

      if (domain != '_global' && yalt.dicts._global) {
        var glob = yalt.dicts._global;
        if (glob[code])
          gettext.fallbacks.push(glob[code]);
        if (glob._fallback && code != glob._fallback)
          gettext.fallbacks.push(glob[glob._fallback]);
      }
    };

    gettext.set(code);

    return gettext;
  },

  dicts: {}
};

if (typeof module != 'undefined' && module.exports) { // node
  var vsprintf = require('sprintf-js').vsprintf;
  module.exports = yalt;
  require('yalt/yalt-util');
}
