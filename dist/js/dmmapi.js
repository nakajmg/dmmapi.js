var DMM;

window.DMM = DMM = (function() {
  function DMM(opt) {
    this._apiId = opt.apiId;
    this._affId = opt.affiliateId;
    this._site = (opt != null ? opt.site : void 0) ? opt.site : "DMM.com";
  }

  DMM.prototype.request = function(params, opt) {
    var query;
    if (params == null) {
      params = {};
    }
    if (opt == null) {
      opt = {};
    }
    params.site = this._site;
    query = "" + this._pipe + (this._getEncodedQuery(params));
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var _script;
        DMM._jsonpCallback = function(data) {
          console.timeEnd("fetch");
          _this.lastResult = new DMM.Result({
            result: data.value.items[0].result
          });
          resolve(data.value.items[0].result);
          DMM._jsonpCallback = null;
          return document.body.removeChild(_script);
        };
        console.time("fetch");
        _script = document.createElement("script");
        _script.src = query;
        return document.body.appendChild(_script);
      };
    })(this));
  };

  DMM.prototype._pipe = "http://pipes.yahoo.com/pipes/pipe.run?_id=a0d6df500601bbe9ebe428d4913d51a6&_callback=DMM._jsonpCallback&_render=json&url=";

  DMM.prototype._apiEntryPoint = "http://affiliate-api.dmm.com/";

  DMM.prototype._getEncodedQuery = function(params) {
    return encodeURIComponent("" + this._apiEntryPoint + "?" + (this._baseQuery()) + (this._paramsToQuery(params)));
  };

  DMM.prototype._baseQuery = function() {
    return "api_id=" + this._apiId + "&affiliate_id=" + this._affId + "&operation=ItemList&version=2.00&timestamp=" + (this._getTimeStamp());
  };

  DMM.prototype._paramsToQuery = function(params) {
    return Object.keys(params).map(function(param) {
      if (param !== "keyword") {
        return "&" + param + "=" + params[param];
      } else {
        return "&" + param + "=" + (EscapeEUCJP(params[param]));
      }
    }).join('');
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

  return DMM;

})();

window.DMM.Result = DMM.Result = (function() {
  function Result(opt) {
    this.result = opt.result;
  }

  Result.prototype.createPagination = function() {
    return console.log(this.result);
  };

  return Result;

})();
