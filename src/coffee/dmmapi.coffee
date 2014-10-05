###
# @class DMM
###
class DMM
  ###
  # DMM Web APIのエントリーポイント
  # @property _apiEntryPoint
  ###
  _apiEntryPoint: "http://affiliate-api.dmm.com/"
  
  ###
  # クロスドメインでリクエストするためのyahoo pipes
  # XMLの結果をJSONに変換して返してくれる
  # @property _pipe
  ###
  _pipe: "http://pipes.yahoo.com/pipes/pipe.run?_id=a0d6df500601bbe9ebe428d4913d51a6&_callback=DMM._jsonpCallback&_render=json&url="  
  
  ###
  # apiIdとaffiliateIdが必須
  # @constructor
  # @param {Object} opt 
  # @param {String} opt.apiId
  # @param {String} opt.affiliateId
  ###
  constructor: (config) ->
    if !config or !config?.apiId or !config?.affiliateId
      # configのプロパティが足りないときはエラー投げる
      throw new Error("apiId or affiliateId property missing.")

    @_apiId = config.apiId
    @_affId = config.affiliateId
    @_site = if config?.site then config.site else "DMM.com"
  
  ###
  # APIにリクエストを投げる。結果は.then()のコールバックで受け取る
  # リクエストはJSONP。Yahoo pipesを使ってXMLをJSONに変換
  # クロスドメインOKだけど遅い
  # TODO オプションでXHRでリクエストできるようにする？Nodeで使える？xhr: true みたいなオプションで
  # @public
  # @method request
  # @params {Object} params
  # @params {Object} _opt 省略可
  # @return Promise
  ###
  request: (params={}, _opt={}) ->
    # siteの指定がなければ、インスタンス作成時の値を使う
    params.site ?= @_site
    
    # リクエストするURLを作る
    query = @_getQuery(params)
    
    return new Promise((resolve, reject) =>
      # リクエストを受け取るコールバック
      DMM._jsonpCallback = (data) =>
        console.timeEnd("fetch")
        @lastResult = new DMM.Items( data: @_clone(data.value.items[0].result))
        resolve(@lastResult)
        # resolve(data.value.items[0].result)
        # 挿入したscript要素とこの関数を破棄する
        DMM._jsonpCallback = null
        document.body.removeChild(_jsonpScript)
      
      console.time("fetch")
      # JSONP用のsciprt要素を作ってDOMに挿入する
      _jsonpScript = document.createElement("script")
      _jsonpScript.src = query
      document.body.appendChild(_jsonpScript)
    )
  
  ###
  # 開発用ダミーリクエスト
  # @method _request
  # @private
  # @return Promise
  ###
  _request: ->
    return new Promise((resolve, reject) =>
      xhr = new XMLHttpRequest()
      xhr.open("GET", "/dummy.json", true)
      xhr.onload = =>
        data = JSON.parse(xhr.responseText)
        @lastResult = new DMM.Items(
          models: @_clone(data.value.items[0].result)
          affId: @_affId
        )
        resolve(@lastResult)
        # resolve(data.value.items[0].result)
        
      xhr.onerror = =>
        console.error "error"
      xhr.send()
    )
  ###
  # paramsからリクエスト先のURLを作成する
  # @private
  # @method _getQuery
  # @params {Object} params
  # @return {Strung}
  ###
  _getQuery: (params) ->
    "#{@_pipe}#{@_encodeQuery(params)}"
    
  ###
  # APIのURLとクエリ文字列をencodeした文字列を返す
  # @private
  # @method _encodeQuery
  # @params {Object} params
  # @return {Strung}
  ###
  _encodeQuery: (params) ->
    encodeURIComponent("#{@_apiEntryPoint}?#{@_baseQuery()}#{@_paramsToQuery(params)}")
  
  ###
  # APIのリクエストに最低限必要なパラメータをクエリ文字列にする
  # @private
  # @method _baseQuery
  # @return {Strung}
  ###
  _baseQuery: ->
    "api_id=#{@_apiId}&affiliate_id=#{@_affId}&operation=ItemList&version=2.00&timestamp=#{@_getTimeStamp()}"
  
  ###
  # paramsからクエリ文字列を作成する
  # @private
  # @method _paramsToQuery
  # @return {Strung}
  ###
  _paramsToQuery: (params) ->
    _.map(params, (value, prop) ->
      if prop isnt "keyword"
        "&#{prop}=#{value}"
      else
        "&#{prop}=#{EscapeEUCJP(value)}"
    ).join('')

  ###
  # タイムスタンプを作成する
  # @private
  # @method _getTimeStamp
  # @return {Strung} yyyy-MM-dd+HH:mm:ss
  ###
  _getTimeStamp: ->
    # ゼロパディング関数
    __pad = (num) ->
      ("0"+num).slice(-2)
    
    date = new Date();
    yyyy = date.getFullYear()
    MM = __pad(date.getMonth() + 1)
    dd = __pad(date.getDate())
    HH = __pad(date.getHours())
    mm = __pad(date.getMinutes())
    ss = __pad(date.getSeconds())
    "#{yyyy}-#{MM}-#{dd}+#{HH}:#{mm}:#{ss}"
  
  ###
  # オブジェクトのディープコピーを返す
  # @method
  # @private
  # @param {Object} json
  # @return {Object}
  ###
  _clone: (json) ->
    return unless json
    JSON.parse(JSON.stringify(json))
  
  
  ###
  # サンプルが画像がないときのリダイレクト先の画像をキャッシュしておく
  # @value redirectImage
  ###
  @redirectImage: do ->
    redirectImage = new Image()
    redirectImage.src = "http://pics.dmm.com/mono/movie/n/now_printing/now_printing.jpg"
  
###
# export
###
if typeof define == "function"
  define(() -> 
    return DMM
  )
else if typeof module == "object"
  module.exports = DMM
else
  window.DMM = DMM
