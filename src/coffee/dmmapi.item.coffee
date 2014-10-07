###
# Itemのモデル。色々メソッド生やす
# 使いやすいように整形する
# @class DMM.Item
###  
DMM.Item = class DMM.Item extends ns.EveEve
  constructor: (opt) ->
    @_initialize(opt)
  
  ###
  # APIの足りないプロパティとかを作成する
  # @method _initialize
  # @private
  # @param {Object} opt
  # @param {Object} opt.data 検索結果の一つ
  # @param {String} opt.affId サンプル動画のURL作成に必要
  ###
  _initialize: (opt) ->
    @parent = opt.parent
    @data = _.extend({}, opt.data)
    @_generateLargeSampleImageURL()
    @_generateFormatReleaseDate()
    @_generateSampleVideoURL(opt.affId)
    @_eventify()
    
  _eventify: ->
    @once("set:availableSampleImagesURL", @_onSetAvailableSampleImageURL)
  
  ###
  # 日付を整形する
  # @method  _generateFormatReleaseDate
  # @private
  # @param {Object} opt
  # @param {String} opt.format 年月日にするかスラッシュ区切りにするか
  #     デフォルトは jp
  ###
  _generateFormatReleaseDate: (opt = {format: "jp"})->
    __pad = (num) ->
      ("0"+num).slice(-2)
    
    date = new Date(@data.date)
    yyyy = date.getFullYear()
    MM = __pad(date.getMonth() + 1)
    dd = __pad(date.getDate())
    
    if opt.format is "jp"
      @data.datef = "#{yyyy}年#{MM}月#{dd}日"
    else
      @data.datef = "#{yyyy}/#{MM}/#{dd}"

  ###
  # サンプル動画のURLを作成する
  # @method _generateSampleVideoURL
  # @private
  # @param {String} affId アフィリエイトID
  ###
  _generateSampleVideoURL: (affId) ->
    content_id = @data.content_id
    @data.sampleVideoURL = 
      pc: "http://www.dmm.co.jp/litevideo/-/part/=/affi_id=#{affId}/cid=#{content_id}"
      # TODO spのサンプル動画をなんとかする
      sp: "http://cc3001.dmm.co.jp/litevideo/freepv/affi_id=#{affId}/#{content_id.substring(0,1)}/#{content_id.substring(0,3)}/#{content_id}/#{content_id}_sm_w.mp4"
  
  ###
  # 大きい画像のURLをAPIが返してくれないから作る
  # @method _generateLargeSampleImageURL
  # @private
  ###
  _generateLargeSampleImageURL: ->
    return unless @data.sampleImageURL
    regexp = /-[0-9]+\.[a-z]+$/
    smallSampleImages = @data.sampleImageURL.sample_s.image
    largeSampleImages = _.map(smallSampleImages, (thumb) ->
      # -数字.拡張子とマッチする部分に jp をつけると大きい画像のURL
      thumb.replace(regexp, (match) ->
        "jp#{match}"
      )
    )
    
    # 
    @data.sampleImageURL.sample_l = image: largeSampleImages
  
  ###
  # sampleImageURLの更新用
  # @method _updateSampleImageURL
  # @params {Array} images
  ###
  _updateSampleImageURL: (images) ->
    @data.sampleImageURL.sample_s.image = images
    @_generateLargeSampleImageURL()
    @parent.trigger("update:sampleImageURL", @data.sampleImageURL)

  ###
  # height 122 width 90 の画像はリダイレクトして表示される画像なし場合の画像
  # smallサイズの画像でサンプルのやつは問答無用で表示できないから削除していい
  # NowPrintingの画像をチェックする
  # @method _checkExistsSampleImageURL
  # @private
  # @return {Array} Promise の配列
  ###
  _checkExistsSampleImageURL: ->
    _.map(@data.sampleImageURL.sample_s.image, (url) =>
      return new Promise((resolve, reject) =>
        img = document.createElement("img")
        img.src = url
        
        if DMM?.redirectImage
          redirectImage = DMM.redirectImage
        else
          redirectImage =
            naturalWidth: 90
            naturalHeight: 122
          
        img.onload = ->
          if img.naturalHeight is redirectImage.naturalHeight and img.naturalWidth is redirectImage.naturalWidth
            resolve(false)
          else
            resolve(url)
            
        img.onerror = ->
          return resolve(false)
      )
    )
  
  setAvailableSampleImageURL: ->
    return new Promise((resolve, reject) =>
      Promise.all(@_checkExistsSampleImageURL()).then((images) =>
        availableSampleImagesURL = _.compact(images)
        @_updateSampleImageURL(availableSampleImagesURL)
        resolve(images)
      )
    )

  _onSetAvailableSampleImageURL: ->
    @setAvailableSampleImageURL()

  ###
  # オブジェクトのディープコピーを返す
  # @method _clone
  # @private
  # @param {Object} json
  # @return {Object}
  ###
  _clone: (json) ->
    return unless json
    JSON.parse(JSON.stringify(json))
    
  ###
  # dataのディープコピーを返す
  # @method toJSON
  # @return {Object}
  ###
  toJSON: ->
    @_clone(@data)

###
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
###
# ToDo: スマホ用のサンプル動画のURLを解析する http://cc3001.dmm.co.jp/litevideo/freepv/:initial/:third/:round_content_id/:round_content_id+_sm_w.mp4
# :initial content_idの頭1文字
# :third content_idの頭から3文字
# :round_content_id 9文字以下ならそのまま。9文字以上なら後半の数字の0をけずる
#     9文字以上でも規則性がないやつがある
# 
# 
# http://cc3001.dmm.co.jp/litevideo/freepv/1/118/118abp156/118abp156_sm_w.mp4
# 118abp00156
# http://cc3001.dmm.co.jp/litevideo/freepv/m/mir/mird00142/mird00142_sm_w.mp4
# mird00142
# http://cc3001.dmm.co.jp/litevideo/freepv/m/mir/mird00141/mird00141_sm_w.mp4
# mird00141
# http://cc3001.dmm.co.jp/litevideo/freepv/1/118/118abp094/118abp094_sm_w.mp4
# 118abp00094
# http://cc3001.dmm.co.jp/litevideo/freepv/h/h_0/h_068mxgs549/h_068mxgs549_sm_w.mp4
# h_068mxgs00549
# http://cc3001.dmm.co.jp/litevideo/freepv/k/kaw/kawd00573/kawd00573_sm_w.mp4
# kawd00573
# http://cc3001.dmm.co.jp/litevideo/freepv/i/ipz/ipz00456/ipz00456_sm_w.mp4
# ipz00456
# http://cc3001.dmm.co.jp/litevideo/freepv/5/55i/55id22030/55id22030_sm_w.mp4
# 55hitma00236
# http://cc3001.dmm.co.jp/litevideo/freepv/1/118/118tre011/118tre011_sm_w.mp4
# 118tre00011
# http://cc3001.dmm.co.jp/litevideo/freepv/5/55t/55t28324/55t28324_sm_w.mp4
# 55hitma00191
# http://cc3001.dmm.co.jp/litevideo/freepv/4/49s/49son120/49son120_sm_w.mp4
# h_766son00120
# http://cc3001.dmm.co.jp/litevideo/freepv/h/h_8/h_826zizg001/h_826zizg001_sm_w.mp4
# h_826zizg00001
