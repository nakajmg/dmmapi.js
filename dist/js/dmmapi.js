
/*
 * @class DMM
 */
var DMM;

window.DMM = DMM = (function() {

  /*
   * DMM Web APIのエントリーポイント
   * @property _apiEntryPoint
   */
  DMM.prototype._apiEntryPoint = "http://affiliate-api.dmm.com/";


  /*
   * クロスドメインでリクエストするためのyahoo pipes
   * XMLの結果をJSONに変換して返してくれる
   * @property _pipe
   */

  DMM.prototype._pipe = "http://pipes.yahoo.com/pipes/pipe.run?_id=a0d6df500601bbe9ebe428d4913d51a6&_callback=DMM._jsonpCallback&_render=json&url=";


  /*
   * apiIdとaffiliateIdが必須
   * @constructor
   * @param {Object} opt 
   * @param {String} opt.apiId
   * @param {String} opt.affiliateId
   */

  function DMM(config) {
    if (!config || !(config != null ? config.apiId : void 0) || !(config != null ? config.affiliateId : void 0)) {
      throw new Error("apiId or affiliateId property missing.");
    }
    this._apiId = config.apiId;
    this._affId = config.affiliateId;
    this._site = (config != null ? config.site : void 0) ? config.site : "DMM.com";
  }


  /*
   * APIにリクエストを投げる。結果は.then()のコールバックで受け取る
   * リクエストはJSONP。Yahoo pipesを使ってXMLをJSONに変換
   * クロスドメインOKだけど遅い
   * TODO オプションでXHRでリクエストできるようにする？Nodeで使える？xhr: true みたいなオプションで
   * @public
   * @method request
   * @params {Object} params
   * @params {Object} _opt 省略可
   * @return Promise
   */

  DMM.prototype.request = function(params, _opt) {
    var query;
    if (params == null) {
      params = {};
    }
    if (_opt == null) {
      _opt = {};
    }
    if (params.site == null) {
      params.site = this._site;
    }
    query = this._getQuery(params);
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var _jsonpScript;
        DMM._jsonpCallback = function(data) {
          console.timeEnd("fetch");
          _this.lastResult = new DMM.Results({
            data: data.value.items[0].result
          });
          resolve(data.value.items[0].result);
          DMM._jsonpCallback = null;
          return document.body.removeChild(_jsonpScript);
        };
        console.time("fetch");
        _jsonpScript = document.createElement("script");
        _jsonpScript.src = query;
        return document.body.appendChild(_jsonpScript);
      };
    })(this));
  };


  /*
   * paramsからリクエスト先のURLを作成する
   * @private
   * @method _getQuery
   * @params {Object} params
   * @return {Strung}
   */

  DMM.prototype._getQuery = function(params) {
    return "" + this._pipe + (this._encodeQuery(params));
  };


  /*
   * APIのURLとクエリ文字列をencodeした文字列を返す
   * @private
   * @method _encodeQuery
   * @params {Object} params
   * @return {Strung}
   */

  DMM.prototype._encodeQuery = function(params) {
    return encodeURIComponent("" + this._apiEntryPoint + "?" + (this._baseQuery()) + (this._paramsToQuery(params)));
  };


  /*
   * APIのリクエストに最低限必要なパラメータをクエリ文字列にする
   * @private
   * @method _baseQuery
   * @return {Strung}
   */

  DMM.prototype._baseQuery = function() {
    return "api_id=" + this._apiId + "&affiliate_id=" + this._affId + "&operation=ItemList&version=2.00&timestamp=" + (this._getTimeStamp());
  };


  /*
   * paramsからクエリ文字列を作成する
   * @private
   * @method _paramsToQuery
   * @return {Strung}
   */

  DMM.prototype._paramsToQuery = function(params) {
    return Object.keys(params).map(function(param) {
      if (param !== "keyword") {
        return "&" + param + "=" + params[param];
      } else {
        return "&" + param + "=" + (EscapeEUCJP(params[param]));
      }
    }).join('');
  };


  /*
   * タイムスタンプを作成する
   * @private
   * @method _getTimeStamp
   * @return {Strung} yyyy-MM-dd+HH:mm:ss
   */

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

window.DMM.Results = DMM.Results = (function() {
  function Results(opt) {
    this.items = opt.data;
  }

  Results.prototype.createPagination = function() {
    return console.log(this.result);
  };

  Results.prototype.getPackages = function() {};

  return Results;

})();
