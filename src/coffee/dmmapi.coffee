
window.DMM = class DMM
  constructor: (opt)->
    @_apiId = opt.apiId
    @_affId = opt.affiliateId
    @_site = if opt?.site then opt.site else "DMM.com"
  
  request: (params={}, opt={}) ->
    params.site = @_site
    query ="#{@_pipe}#{@_getEncodedQuery(params)}"
    return new Promise((resolve, reject) =>  
      DMM._jsonpCallback = (data) =>
        console.timeEnd("fetch")
        @lastResult = new DMM.Result( result: data.value.items[0].result)
        
        resolve(data.value.items[0].result)
        DMM._jsonpCallback = null
        document.body.removeChild(_script)
      
      console.time("fetch")
      _script = document.createElement("script")
      _script.src = query
      document.body.appendChild(_script)
    )
  
  _pipe: "http://pipes.yahoo.com/pipes/pipe.run?_id=a0d6df500601bbe9ebe428d4913d51a6&_callback=DMM._jsonpCallback&_render=json&url="  
  _apiEntryPoint: "http://affiliate-api.dmm.com/"
  
  _getEncodedQuery: (params)->
    encodeURIComponent("#{@_apiEntryPoint}?#{@_baseQuery()}#{@_paramsToQuery(params)}")
    
  _baseQuery: ->
    "api_id=#{@_apiId}&affiliate_id=#{@_affId}&operation=ItemList&version=2.00&timestamp=#{@_getTimeStamp()}"
  
  _paramsToQuery: (params) ->
    Object.keys(params).map((param) ->
      if param != "keyword"
        "&#{param}=#{params[param]}"
      else
        "&#{param}=#{EscapeEUCJP(params[param])}"
    ).join('')

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
    

window.DMM.Result = class DMM.Result
  constructor: (opt) ->
    @result = opt.result

  createPagination: ->
    console.log @result
  
  
    
    
