###
# DMM.Itemモデルのコレクション
# @class DMM.Items extend ns.EveEve
###
DMM.Items = class DMM.Items extends ns.EveEve
  constructor: (opt) ->
    @_initialize(opt)
  
  ###
  # 初期化
  # @method _initialize
  # @private
  # @param {Object} opt
  # @param {Object} opt.data 検索結果の帯ジェクト
  # @param {String} opt.affId サンプル動画のURL作成に必要
  ###
  _initialize: (opt) ->
    @_affId = opt.affId
    @_generateItemCollection(opt.data.items.item)
    @_eventify()
  
  _eventify: ->
    @on("update:sampleImageURL", @_onUpdateSampleImageURL)
  
  ###
  # DMM.Itemのコレクションを作成する
  # @method _generateItemCollection
  # @private
  # @param {Array} items APIから受け取った結果の配列
  ###
  _generateItemCollection: (items) ->
    if @data
      # 既にdataがある場合にはprevDataに前の結果を入れておく
      @prevData = @_clone(@data)
    
    @data = _.map(items, (item) =>
      new DMM.Item({data: item, affId: @_affId, parent: @})
    )
    # .splice(0,3)
    # .splice(4,5)
  
  ###
  # Itemのサンプル画像の存在チェックイベントを発行
  # @method setAvailableSampleImageURL
  ###
  setAvailableSampleImageURL: ->
    _.each(@data, (item) =>
      item.trigger("set:availableSampleImagesURL")
    )
  
  ###
  # updateが何件終わったかカウント
  ###
  _updateCount: 0
  
  ###
  # ItemのsampleImageURLがupdateされるカウントアップする
  # data.lengthと同じになれば完了イベントを自身に通知
  # @method _onUpdateSampleImageURL
  # @private
  ###
  _onUpdateSampleImageURL: ->
    @_updateCount++
    if @_updateCount == @data.length
      @_updateCount = 0
      @trigger("complete:setAvailableSampleImageURL")
  
  ###
  # @param {Object} opt
  # @param {String} opt.size large/small/list
  ###
  getPackages: (opt) ->
    size = unless opt?.size then "large" else opt.size
    _.map(@data, (item) =>
      debugger
      item.getPackage(size)
    )
    
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
  # Itemのdataのディープコピーを返す
  # @method toJSON
  # @return {Array} Itemモデルのdataの値の配列
  ###
  toJSON: ->
    _.map(@data, (item) ->
      item.toJSON()
    )
