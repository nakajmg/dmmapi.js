
window.DMM = class DMM
  constructor: (opt)->
    @_apiId = opt.apiId
    @_affId = opt.affiliateId
  
  
  _pipe: "http://pipes.yahoo.com/pipes/pipe.run?_id=a0d6df500601bbe9ebe428d4913d51a6&_callback=DMM._jsonpCallback&_render=json&url="  
  _entryPoint: "http://affiliate-api.dmm.com/"
  
  _generateQuery: (params)->
    encodeURIComponent("#{@_baseQuery() + @_createQueryString(params)}")
    
  _baseQuery: ->
    "#{@_entryPoint}?api_id=#{@_apiId}&affiliate_id=#{@_affId}&operation=ItemList&version=2.00&timestamp=#{@_getTimeStamp()}"
  
  _createQueryString: (params) ->
    queryString = ""
    Object.keys(params).forEach((param) ->
      if param == "keyword"
        queryString += "&#{param}=#{EscapeEUCJP(params[param])}"
      else
        queryString += "&#{param}=#{params[param]}"
    )
    return queryString

  _getTimeStamp: ->
    pad = (num) ->
      ("0"+num).slice(-2)
    
    date = new Date();
    yyyy = date.getFullYear()
    MM = pad(date.getMonth() + 1)
    dd = pad(date.getDate())
    HH = pad(date.getHours())
    mm = pad(date.getMinutes())
    ss = pad(date.getSeconds())
    "#{yyyy}-#{MM}-#{dd}+#{HH}:#{mm}:#{ss}"
    
  _createYQL: (params, opt={}) ->
    if !opt.format
      opt.format = "json"
    apiQuery = @_generateQuery(params)
    yqlUrl = "#{location.protocol}//query.yahooapis.com/v1/public/yql?"    
    "#{yqlUrl}q=select * from xml where url = %22#{apiQuery}%22&format=#{opt.format}&callback=DMM._jsonpCallback"

  
  fetch: (params={}, opt={}) ->
    params.site = "DMM.co.jp"
    params.keyword = "コスプレ"
    apiQuery = @_generateQuery(params)
      
    return new Promise((resolve, reject) =>
    
      DMM._jsonpCallback = (data) =>
        @lastResult = data.value.items[0].result
        # resolve(new DMM.Result(@lastResult))
        resolve(@lastResult)
        
      
      $.ajax({
        method: "GET"
        dataType: "jsonp"
        url: "http://pipes.yahoo.com/pipes/pipe.run?_id=DJEg41Ac3BG8IAI2E5PZnA&_callback=DMM._jsonpCallback&_render=json&url="+ encodeURIComponent(apiQuery)
      })
      
    )

  request: (params={}, opt={}) ->
    params.site = "DMM.co.jp"
    # params.keyword = "コスプレ"
    
    query = 
    url ="#{@_pipe}#{@_generateQuery(params)}"
    return new Promise((resolve, reject) =>  
      DMM._jsonpCallback = (data) =>
        console.timeEnd("fetch")
        @lastResult = data.value.items[0].result
        resolve(@lastResult)
        DMM._jsonpCallback = null
        document.body.removeChild(_script)
      
      console.time("fetch")
      _script = document.createElement("script")
      _script.src = url
      document.body.appendChild(_script)
    )

window.DMM.Result = class DMM.Result
  constructor: (opt) ->
    @result = opt
