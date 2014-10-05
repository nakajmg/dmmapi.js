(function() {
  var DMM, ns,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ns = window;

  ns.EveEve = (function() {
    function EveEve() {}

    EveEve.prototype.on = function(ev, callback) {
      var evs, name, _base, _i, _len;
      if (this._callbacks == null) {
        this._callbacks = {};
      }
      evs = ev.split(' ');
      for (_i = 0, _len = evs.length; _i < _len; _i++) {
        name = evs[_i];
        (_base = this._callbacks)[name] || (_base[name] = []);
        this._callbacks[name].push(callback);
      }
      return this;
    };

    EveEve.prototype.once = function(ev, callback) {
      this.on(ev, function() {
        this.off(ev, arguments.callee);
        return callback.apply(this, arguments);
      });
      return this;
    };

    EveEve.prototype.trigger = function() {
      var args, callback, ev, list, _i, _len, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ev = args.shift();
      list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
      if (!list) {
        return;
      }
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        callback = list[_i];
        if (callback.apply(this, args) === false) {
          break;
        }
      }
      return this;
    };

    EveEve.prototype.off = function(ev, callback) {
      var cb, evs, i, list, name, _i, _j, _len, _len1, _ref;
      if (!ev) {
        this._callbacks = {};
        return this;
      }
      evs = ev.split(' ');
      for (_i = 0, _len = evs.length; _i < _len; _i++) {
        name = evs[_i];
        list = (_ref = this._callbacks) != null ? _ref[name] : void 0;
        if (list) {
          if (callback) {
            for (i = _j = 0, _len1 = list.length; _j < _len1; i = ++_j) {
              cb = list[i];
              if (!(cb === callback)) {
                continue;
              }
              list = list.slice();
              list.splice(i, 1);
              this._callbacks[name] = list;
            }
          } else {
            delete this._callbacks[name];
          }
        }
      }
      return this;
    };

    return EveEve;

  })();


  /*
   * @class DMM
   */

  DMM = (function() {

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
            _this.lastResult = new DMM.Items({
              data: _this._clone(data.value.items[0].result)
            });
            resolve(_this.lastResult);
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
     * 開発用ダミーリクエスト
     * @method _request
     * @private
     * @return Promise
     */

    DMM.prototype._request = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var xhr;
          xhr = new XMLHttpRequest();
          xhr.open("GET", "/dummy.json", true);
          xhr.onload = function() {
            var data;
            data = JSON.parse(xhr.responseText);
            _this.lastResult = new DMM.Items({
              models: _this._clone(data.value.items[0].result),
              affId: _this._affId
            });
            return resolve(_this.lastResult);
          };
          xhr.onerror = function() {
            return console.error("error");
          };
          return xhr.send();
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
      return _.map(params, function(value, prop) {
        if (prop !== "keyword") {
          return "&" + prop + "=" + value;
        } else {
          return "&" + prop + "=" + (EscapeEUCJP(value));
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
      var HH, MM, date, dd, mm, ss, yyyy, __pad;
      __pad = function(num) {
        return ("0" + num).slice(-2);
      };
      date = new Date();
      yyyy = date.getFullYear();
      MM = __pad(date.getMonth() + 1);
      dd = __pad(date.getDate());
      HH = __pad(date.getHours());
      mm = __pad(date.getMinutes());
      ss = __pad(date.getSeconds());
      return "" + yyyy + "-" + MM + "-" + dd + "+" + HH + ":" + mm + ":" + ss;
    };


    /*
     * オブジェクトのディープコピーを返す
     * @method
     * @private
     * @param {Object} json
     * @return {Object}
     */

    DMM.prototype._clone = function(json) {
      if (!json) {
        return;
      }
      return JSON.parse(JSON.stringify(json));
    };


    /*
     * サンプルが画像がないときのリダイレクト先の画像をキャッシュしておく
     * @value redirectImage
     */

    DMM.redirectImage = (function() {
      var redirectImage;
      redirectImage = new Image();
      return redirectImage.src = "http://pics.dmm.com/mono/movie/n/now_printing/now_printing.jpg";
    })();

    return DMM;

  })();


  /*
   * export
   */

  if (typeof define === "function") {
    define(function() {
      return DMM;
    });
  } else if (typeof module === "object") {
    module.exports = DMM;
  } else {
    window.DMM = DMM;
  }


  /*
   * Itemのモデル。色々メソッド生やす
   * 使いやすいように整形する
   * @class DMM.Item
   */

  DMM.Item = DMM.Item = (function(_super) {
    __extends(Item, _super);

    function Item(opt) {
      this._initialize(opt);
    }


    /*
     * APIの足りないプロパティとかを作成する
     * @method _initialize
     * @private
     * @param {Object} opt
     * @param {Object} opt.data 検索結果の一つ
     * @param {String} opt.affId サンプル動画のURL作成に必要
     */

    Item.prototype._initialize = function(opt) {
      this.parent = opt.parent;
      this.data = _.extend({}, opt.data);
      this._generateLargeSampleImageURL();
      this._generateFormatReleaseDate();
      this._generateSampleVideoURL(opt.affId);
      return this._eventify();
    };

    Item.prototype._eventify = function() {
      return this.once("set:availableSampleImagesURL", this._onSetAvailableSampleImageURL);
    };


    /*
     * 日付を整形する
     * @method  _generateFormatReleaseDate
     * @private
     * @param {Object} opt
     * @param {String} opt.format 年月日にするかスラッシュ区切りにするか
     *     デフォルトは jp
     */

    Item.prototype._generateFormatReleaseDate = function(opt) {
      var MM, date, dd, yyyy, __pad;
      if (opt == null) {
        opt = {
          format: "jp"
        };
      }
      __pad = function(num) {
        return ("0" + num).slice(-2);
      };
      date = new Date(this.data.date);
      yyyy = date.getFullYear();
      MM = __pad(date.getMonth() + 1);
      dd = __pad(date.getDate());
      if (opt.format === "jp") {
        return this.data.datef = "" + yyyy + "年" + MM + "月" + dd + "日";
      } else {
        return this.data.datef = "" + yyyy + "/" + MM + "/" + dd;
      }
    };


    /*
     * サンプル動画のURLを作成する
     * @method _generateSampleVideoURL
     * @private
     * @param {String} affId アフィリエイトID
     */

    Item.prototype._generateSampleVideoURL = function(affId) {
      var content_id;
      content_id = this.data.content_id;
      return this.data.sampleVideoURL = {
        pc: "http://www.dmm.co.jp/litevideo/-/part/=/affi_id=" + affId + "/cid=" + content_id,
        sp: "http://cc3001.dmm.co.jp/litevideo/freepv/affi_id=" + affId + "/" + (content_id.substring(0, 1)) + "/" + (content_id.substring(0, 3)) + "/" + content_id + "/" + content_id + "_sm_w.mp4"
      };
    };


    /*
     * 大きい画像のURLをAPIが返してくれないから作る
     * @method _generateLargeSampleImageURL
     * @private
     */

    Item.prototype._generateLargeSampleImageURL = function() {
      var largeSampleImages, regexp, smallSampleImages;
      regexp = /-[0-9]+\.[a-z]+$/;
      smallSampleImages = this.data.sampleImageURL.sample_s.image;
      largeSampleImages = _.map(smallSampleImages, function(thumb) {
        return thumb.replace(regexp, function(match) {
          return "jp" + match;
        });
      });
      return this.data.sampleImageURL.sample_l = {
        image: largeSampleImages
      };
    };


    /*
     * sampleImageURLの更新用
     * @method _updateSampleImageURL
     * @params {Array} images
     */

    Item.prototype._updateSampleImageURL = function(images) {
      this.data.sampleImageURL.sample_s.image = images;
      this._generateLargeSampleImageURL();
      return this.parent.trigger("update:sampleImageURL", this.data.sampleImageURL);
    };


    /*
     * height 122 width 90 の画像はリダイレクトして表示される画像なし場合の画像
     * smallサイズの画像でサンプルのやつは問答無用で表示できないから削除していい
     * NowPrintingの画像をチェックする
     * @method _checkExistsSampleImageURL
     * @private
     * @return {Array} Promise の配列
     */

    Item.prototype._checkExistsSampleImageURL = function() {
      return _.map(this.data.sampleImageURL.sample_s.image, (function(_this) {
        return function(url) {
          return new Promise(function(resolve, reject) {
            var img, redirectImage;
            img = document.createElement("img");
            img.src = url;
            if (DMM != null ? DMM.redirectImage : void 0) {
              redirectImage = DMM.redirectImage;
            } else {
              redirectImage = {
                naturalWidth: 90,
                naturalHeight: 122
              };
            }
            img.onload = function() {
              if (img.naturalHeight === redirectImage.naturalHeight && img.naturalWidth === redirectImage.naturalWidth) {
                return resolve(false);
              } else {
                return resolve(url);
              }
            };
            return img.onerror = function() {
              return resolve(false);
            };
          });
        };
      })(this));
    };

    Item.prototype.setAvailableSampleImageURL = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return Promise.all(_this._checkExistsSampleImageURL()).then(function(images) {
            var availableSampleImagesURL;
            availableSampleImagesURL = _.compact(images);
            _this._updateSampleImageURL(availableSampleImagesURL);
            return resolve(images);
          });
        };
      })(this));
    };

    Item.prototype._onSetAvailableSampleImageURL = function() {
      return this.setAvailableSampleImageURL();
    };


    /*
     * オブジェクトのディープコピーを返す
     * @method _clone
     * @private
     * @param {Object} json
     * @return {Object}
     */

    Item.prototype._clone = function(json) {
      if (!json) {
        return;
      }
      return JSON.parse(JSON.stringify(json));
    };


    /*
     * dataのディープコピーを返す
     * @method toJSON
     * @return {Object}
     */

    Item.prototype.toJSON = function() {
      return this._clone(this.data);
    };

    return Item;

  })(ns.EveEve);


  /*
  {
    "service_name": "動画",
    "floor_name": "ビデオ",
    "category_name": "ビデオ (動画)",
    "content_id": "118abp00156",
    "product_id": "118abp00156",
    "title": "柚月あいがご奉仕しちゃう 超最新やみつきエステ",
    "URL": "http://www.dmm.co.jp/digital/videoa/-/detail/=/cid=118abp00156/",
    "affiliateURL": "http://www.dmm.co.jp/digital/videoa/-/detail/=/cid=118abp00156/jmglabo-990",
    "imageURL": {
      "list": "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156pt.jpg",
      "small": "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156ps.jpg",
      "large": "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156pl.jpg"
    },
    "sampleImageURL": {
      "sample_s": {
        "image": [
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-1.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-2.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-3.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-4.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-5.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-6.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-7.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-8.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-9.jpg",
          "http://pics.dmm.co.jp/digital/video/118abp00156/118abp00156-10.jpg"
        ]
      }
    },
    "prices": {
      "price": "500～",
      "deliveries": {
        "delivery": [
          { "type": "stream", "price": "500" },
          { "type": "download", "price": "1300" },
          { "type": "hd", "price": "1500" },
          { "type": "androiddl", "price": "1300" },
          { "type": "iosdl", "price": "1300" }
        ]
      }
    },
    "date": "2014-06-11 10:00:34",
    "iteminfo": {
      "keyword": [
        { "name": "単体作品", "id": "4025" },
        { "name": "手コキ", "id": "5004" },
        { "name": "コスプレ", "id": "4031" },
        { "name": "マッサージ", "id": "4124" },
        { "name": "エステ", "id": "4119" },
        { "name": "ハイビジョン", "id": "6533" }
      ],
      "series": { "name": "最新やみつきエステ", "id": "203366" },
      "maker": { "name": "プレステージ", "id": "40136" },
      "actress": [
        { "name": "柚月あい", "id": "1023801" },
        { "name": "ゆづきあい", "id": "1023801_ruby" },
        { "name": "av", "id": "1023801_classify" }
      ],
      "director": [
        { "name": "C:TAKERU", "id": "101631" },
        { "name": "しーたける", "id": "101631_ruby" }
      ],
      "label": { "name": "ABSOLUTELY PERFECT", "id": "24164" }
    }
  }
   */


  /*
   * DMM.Itemモデルのコレクション
   * @class DMM.Items extend ns.EveEve
   */

  DMM.Items = DMM.Items = (function(_super) {
    __extends(Items, _super);

    function Items(opt) {
      this._initialize(opt);
    }


    /*
     * 初期化
     * @method _initialize
     * @private
     * @param {Object} opt
     * @param {Object} opt.models 検索結果の帯ジェクト
     * @param {String} opt.affId サンプル動画のURL作成に必要
     */

    Items.prototype._initialize = function(opt) {
      this._affId = opt.affId;
      this._generateItemCollection(opt.models.items.item);
      return this._eventify();
    };

    Items.prototype._eventify = function() {
      return this.on("update:sampleImageURL", this._onUpdateSampleImageURL);
    };


    /*
     * DMM.Itemのコレクションを作成する
     * @method _generateItemCollection
     * @private
     * @param {Array} items APIから受け取った結果の配列
     */

    Items.prototype._generateItemCollection = function(items) {
      if (this.data) {
        this.prevData = this._clone(this.data);
      }
      return this.data = _.map(items, (function(_this) {
        return function(item) {
          return new DMM.Item({
            data: item,
            affId: _this._affId,
            parent: _this
          });
        };
      })(this));
    };


    /*
     * Itemのサンプル画像の存在チェックイベントを発行
     * @method setAvailableSampleImageURL
     */

    Items.prototype.setAvailableSampleImageURL = function() {
      return _.each(this.data, (function(_this) {
        return function(item) {
          return item.trigger("set:availableSampleImagesURL");
        };
      })(this));
    };


    /*
     * updateが何件終わったかカウント
     */

    Items.prototype._updateCount = 0;


    /*
     * ItemのsampleImageURLがupdateされるカウントアップする
     * data.lengthと同じになれば完了イベントを自身に通知
     * @method _onUpdateSampleImageURL
     * @private
     */

    Items.prototype._onUpdateSampleImageURL = function() {
      this._updateCount++;
      if (this._updateCount === this.data.length) {
        this._updateCount = 0;
        return this.trigger("complete:setAvailableSampleImageURL");
      }
    };


    /*
     * @param {Object} opt
     * @param {String} opt.size large/small/list
     */

    Items.prototype.getPackages = function(opt) {
      var size;
      size = !(opt != null ? opt.size : void 0) ? "large" : opt.size;
      return _.map(this.data, (function(_this) {
        return function(item) {
          debugger;
          return item.getPackage(size);
        };
      })(this));
    };


    /*
     * オブジェクトのディープコピーを返す
     * @method _clone
     * @private
     * @param {Object} json
     * @return {Object}
     */

    Items.prototype._clone = function(json) {
      if (!json) {
        return;
      }
      return JSON.parse(JSON.stringify(json));
    };


    /*
     * Itemのdataのディープコピーを返す
     * @method toJSON
     * @return {Array} Itemモデルのdataの値の配列
     */

    Items.prototype.toJSON = function() {
      return _.map(this.data, function(item) {
        return item.toJSON();
      });
    };

    return Items;

  })(ns.EveEve);

}).call(this);
