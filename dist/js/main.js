var DMM;

window.DMM = DMM = (function() {
  function DMM(opt) {
    this._apiId = opt.apiId;
    this._affId = opt.affiliateId;
  }

  DMM.prototype._pipe = "http://pipes.yahoo.com/pipes/pipe.run?_id=a0d6df500601bbe9ebe428d4913d51a6&_callback=DMM._jsonpCallback&_render=json&url=";

  DMM.prototype._entryPoint = "http://affiliate-api.dmm.com/";

  DMM.prototype._generateQuery = function(params) {
    return encodeURIComponent("" + (this._baseQuery() + this._createQueryString(params)));
  };

  DMM.prototype._baseQuery = function() {
    return "" + this._entryPoint + "?api_id=" + this._apiId + "&affiliate_id=" + this._affId + "&operation=ItemList&version=2.00&timestamp=" + (this._getTimeStamp());
  };

  DMM.prototype._createQueryString = function(params) {
    var queryString;
    queryString = "";
    Object.keys(params).forEach(function(param) {
      if (param === "keyword") {
        return queryString += "&" + param + "=" + (EscapeEUCJP(params[param]));
      } else {
        return queryString += "&" + param + "=" + params[param];
      }
    });
    return queryString;
  };

  DMM.prototype._getTimeStamp = function() {
    var HH, MM, date, dd, mm, pad, ss, yyyy;
    pad = function(num) {
      return ("0" + num).slice(-2);
    };
    date = new Date();
    yyyy = date.getFullYear();
    MM = pad(date.getMonth() + 1);
    dd = pad(date.getDate());
    HH = pad(date.getHours());
    mm = pad(date.getMinutes());
    ss = pad(date.getSeconds());
    return "" + yyyy + "-" + MM + "-" + dd + "+" + HH + ":" + mm + ":" + ss;
  };

  DMM.prototype._createYQL = function(params, opt) {
    var apiQuery, yqlUrl;
    if (opt == null) {
      opt = {};
    }
    if (!opt.format) {
      opt.format = "json";
    }
    apiQuery = this._generateQuery(params);
    yqlUrl = "" + location.protocol + "//query.yahooapis.com/v1/public/yql?";
    return "" + yqlUrl + "q=select * from xml where url = %22" + apiQuery + "%22&format=" + opt.format + "&callback=DMM._jsonpCallback";
  };

  DMM.prototype.fetch = function(params, opt) {
    var apiQuery;
    if (params == null) {
      params = {};
    }
    if (opt == null) {
      opt = {};
    }
    params.site = "DMM.co.jp";
    params.keyword = "コスプレ";
    apiQuery = this._generateQuery(params);
    return new Promise((function(_this) {
      return function(resolve, reject) {
        DMM._jsonpCallback = function(data) {
          _this.lastResult = data.value.items[0].result;
          return resolve(_this.lastResult);
        };
        return $.ajax({
          method: "GET",
          dataType: "jsonp",
          url: "http://pipes.yahoo.com/pipes/pipe.run?_id=DJEg41Ac3BG8IAI2E5PZnA&_callback=DMM._jsonpCallback&_render=json&url=" + encodeURIComponent(apiQuery)
        });
      };
    })(this));
  };

  DMM.prototype.request = function(params, opt) {
    var query, url;
    if (params == null) {
      params = {};
    }
    if (opt == null) {
      opt = {};
    }
    params.site = "DMM.co.jp";
    query = url = "" + this._pipe + (this._generateQuery(params));
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var _script;
        DMM._jsonpCallback = function(data) {
          console.timeEnd("fetch");
          _this.lastResult = data.value.items[0].result;
          resolve(_this.lastResult);
          DMM._jsonpCallback = null;
          return document.body.removeChild(_script);
        };
        console.time("fetch");
        _script = document.createElement("script");
        _script.src = url;
        return document.body.appendChild(_script);
      };
    })(this));
  };

  return DMM;

})();

window.DMM.Result = DMM.Result = (function() {
  function Result(opt) {
    this.result = opt;
  }

  return Result;

})();
