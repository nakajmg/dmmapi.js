!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

$(document).ready(function(){
	var over18 = jQuery.cookie('over18');
	if(over18 !== "Yes"){
		confirm();
	}
});

function confirm(){
	$('#basic-modal-content').modal({
		onShow: function(dialog){
			var modal = this;
			jQuery('.yes',dialog.data[0]).click(function(){
				var clifetime = new Date();
				clifetime.setTime(clifetime.getTime()+(6*60*60*1000));//2時間
				jQuery.cookie('over18','Yes',{ expires: clifetime });
				modal.close();
			});
		}
	});
	return false;
 } 

(function() {
	var DMM, Pagination, UI;

	DMM = (function() {
		var dateFormat, getQueryString, getTimestamp, getYQL, padZero;

		function DMM(opt) {
			this.opt = opt;
		}

		DMM.prototype.search = function(query) {
			var dfd;
			dfd = new $.Deferred();
			$.ajax({
				'url': 'http://query.yahooapis.com/v1/public/yql?callback=?',
				'data': {
					'q': getYQL.apply(this, [query]),
					'format': 'json'
					},
				'dataType': 'jsonp',
				'cache': false,
				'success': function(res) {
					return dfd.resolve(res.query.results.responce.result);
				},
				'fail': function() {
					return dfd.reject({
						'title': 'エラー',
						'message': ''
					});
				}
			});
			return dfd.promise();
		};

		getYQL = function(query) {
			var item, params, url, _i, _len;
			params = {
				'site': 'DMM.co.jp',
				'version': '1.00',
				'operation': 'ItemList',
				'timestamp': getTimestamp(),
				'api_id': this.opt.api_id,
				'affiliate_id': this.opt.affiliate_id,
				'keyword': "サンプル動画"
			};
			for (_i = 0, _len = query.length; _i < _len; _i++) {
				item = query[_i];
				params[item.name] = item.value;
			}
			url = 'http://affiliate-api.dmm.com/?' + getQueryString(params);
			return "select * from xml where url = '" + url + "'";
		};
	
		getQueryString = function(params) {
			var k, q, v;
			q = [];
			for (k in params) {
				v = params[k];
				if(k == "keyword") {
					if(v != ""){
						v = "サンプル動画 " + v ;
					} else {
						v = "サンプル動画";
					}
				}
				q.push([EscapeEUCJP(k), EscapeEUCJP(v)].join('='));
			}
			return q.join('&');
		};
		
		getTimestamp = function() {
			return dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
		};
	
		dateFormat = function(date, format) {
			var rep, result;
			result = format;
			if (result.indexOf('yyyy') > -1) {
				rep = date.getFullYear();
				result = result.replace(/yyyy/, rep);
			}
			if (result.indexOf('MM') > -1) {
				rep = padZero(date.getMonth() + 1, 2);
				result = result.replace(/MM/, rep);
			}
			if (result.indexOf('dd') > -1) {
				rep = padZero(date.getDate(), 2);
				result = result.replace(/dd/, rep);
			}
			if (result.indexOf('HH') > -1) {
				rep = padZero(date.getHours(), 2);
				result = result.replace(/HH/, rep);
			}
			if (result.indexOf('mm') > -1) {
				rep = padZero(date.getMinutes(), 2);
				result = result.replace(/mm/, rep);
			}
			if (result.indexOf('ss') > -1) {
				rep = padZero(date.getSeconds(), 2);
				result = result.replace(/ss/, rep);
			}
			return result;
		};
	
		padZero = function(value, length) {
			return new Array(length - ('' + value).length + 1).join('0') + value;
		};
	
		return DMM;
	
	})();

	UI = (function() {
		var build, pagination, services, setup;

		function UI(opt) {
			this.opt = opt;
			if (!this.opt.dmm) return;
			if (!this.opt.table) return;
			if (!this.opt.template) return;
			setup.apply(this);
			this.opt.dmm.opt.form.submit();
		}

		services = {
			'DMM.co.jp': {
				'label': 'DMM.R18 全体',
				'digital': {
					'label': '動画',
					'videoa': 'ビデオ',
					'videoc': '素人',
					'nikkatsu': '成人映画',
					'anime': 'アニメ',
					'photo': '電子写真集'
				},
				'monthly': {
					'label': '月額動画',
					'shirouto': '素人ガールズコレクション',
					'nikkatsu': 'ピンク映画',
					'paradisetv': 'パラダイステレビ',
					'animech': 'アダルトアニメ',
					'dream': 'ドリーム',
					'avstation': 'AVステーション',
					'playgirl': 'プレイガール',
					'alice': 'アリス',
					'crystal': 'クリスタル',
					'hmp': 'h.m.p',
					'waap': 'Waap',
					'momotarobb': '桃太郎BB',
					'moodyz': 'MOODYZ',
					'prestige': 'プレステージ',
					'jukujo': '熟女チャンネル',
					'sod': 'ソフト・オン・デマンド',
					'mania': 'マニア',
					's1': 'エスワン ナンバーワンスタイル',
					'kmp': 'KMP'
				},
				'ppm': {
					'label': '1円動画',
					'video': 'ビデオ',
					'videoc': '素人'
				},
				'pcgame': '美少女ゲーム',
				'mono': {
					'label': '通販',
					'dvd': 'DVD',
					'goods': '大人のおもちゃ',
					'anime': 'アニメ',
					'pcgame': '美少女ゲーム',
					'book': 'ブック',
					'doujin': '同人'
				},
				'rental': {
					'label': 'DVDレンタル',
					'rental_dvd': '月額レンタル',
					'ppr_dvd': '単品レンタル',
					'set_dvd': 'セットレンタル'
				}
			}
		};
	
		setup = function() {
			var floor, form, hits, keyword, loading, offset, paginations, self, service, site, stock;
			self = this;
			form = this.opt.dmm.opt.form;
			floor = $('select[name=selfloor]', form);
			stock = $('select[name=selstock]', form);
			offset = $('input[name=offset]', form);
			site = $('input[name=site]', form);
			hits = $('select[name=selhits]', form);
			service = $('select[name=selservice]', form);
			keyword = $('input[name=keyword]', form);
			paginations = $('.pagination');
			loading = $('#loading');
			form.on('submit', function(event) {
				event.preventDefault();
				setTimeout(function() {
					return self.opt.table.empty();
				}, 200);
			self.opt.table.removeClass('in');
			self.opt.alert.hide().removeClass('in');
			paginations.removeClass('in');
			loading.show().addClass('in');
			return self.opt.dmm.search($(this).find(':input').serializeArray()).then($.proxy(build, self), $.proxy(self.alert, self));
		});
		$('.btn-group[data-toggle-name]', form).each(function() {
			var group, hidden, name;
			group = $(this);
			name = group.data('toggle-name');
			hidden = $('input[name="' + name + '"]', form);
			return $('button', group).each(function() {
				var button;
				button = $(this);
				button.on('click', function(event) {
					event.preventDefault();
					if (button.hasClass('active')) return;
					hidden.val(button.val());
					return hidden.trigger('change');
				});
				if (button.val() === hidden.val()) return button.addClass('active');
			});
		});
		service.on('change', function() {
			var k, label, selected, siteVal, v, val, _ref, _results;
			selected = service.val();
			siteVal = site.val();
			if (selected === 'mono') {
				stock.parent().show().addClass('in');
			} else {
				stock.val('');
				stock.parent().hide().removeClass('in');
			}
			if (!selected || typeof services[siteVal][selected] === 'string') {
				floor.val('');
				floor.hide().removeClass('in');
				return;
			}
			floor.empty();
			_ref = services[siteVal][selected];
			_results = [];
			for (k in _ref) {
				v = _ref[k];
				if (k === 'label') {
					val = '';
					label = '全体';
				} else {
					val = k;
					label = v;
				}
				$('<option />').attr('value', val).text(label).appendTo(floor);
				_results.push(floor.show().addClass('in'));
			}
			return _results;
		});
		site.on('change', function() {
			var k, label, v, val, _ref;
			service.empty();
			_ref = services[site.val()];
			for (k in _ref) {
				v = _ref[k];
				if (k === 'label') {
					val = '';
					label = v;
				} else {
					val = k;
					label = typeof v === 'string' ? v : v.label;
				}
				$('<option />').attr('value', val).text(label).appendTo(service);
			}
			return service.trigger('change');
		}).trigger('change');
		paginations.on('click', 'a', function(event) {
			var li, page, per;
			event.preventDefault();
			li = $(this).parent();
			if (li.hasClass('disabled') || li.hasClass('active')) return;
			page = $(this).data('page') - 1;
			per = hits.val() - 0;
			offset.val(page * per + 1);
			return form.submit();
		});
		this.opt.table.on('click', '.tag a', function(event) {
			event.preventDefault();
			SetParam();
			keyword.val($(this).text());
			return form.submit();
		});
		return this.opt.table.on('click', '.actress a', function(event) {
			event.preventDefault();
			SetParam();
			keyword.val($(this).text());
			return form.submit();
		});
	};

	build = function(data) {
		$('#loading').hide().removeClass('in');
		(function() {
			if (!(data.items != null)) return data;
			this.opt.table.html('<tbody>' + this.opt.template.render(data.items.item) + '</tbody>');
			return data;
		}).apply(this);
		this.opt.table.addClass('in');
		return pagination.apply(this, [data]);
	};

	pagination = function(data) {
		var current, form, hits, total, ul;
		if (data.total_count > 50000) data.total_count = 50000;
		form = this.opt.dmm.opt.form;
		hits = $('select[name=selhits]', form).val();
		current = Math.ceil(data.first_position / hits);
		total = Math.ceil(data.total_count / hits);
		ul = new Pagination().get({
			'current': current,
			'total': total
		});
		$('.pagination').each(function() {
			return $(this).empty().append(ul.clone());
		}).addClass('in');
		return ul.remove();
	};

	UI.prototype.alert = function(data) {
		var o;
		o = '<p>' + data.message + '</p>';
		if (data.title) o = '<strong>' + data.title(+'</strong>' + o);
		return this.opt.alert.html(o).show().addClass('in');
	};

	return UI;

})();

Pagination = (function() {
	var def;
	
	function Pagination() {}
	if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {  
		def = {
			'range': 2,
			'prev': '\u00ab',
			'next': '\u00bb'
		};
	} else {
		def = {
			'range': 5,
			'prev': '\u00ab',
			'next': '\u00bb'
		};
	}
	
	Pagination.prototype.get = function(opt) {
		var current, divider, half, k, list, max, min, next, prev, range, skip_next, skip_prev, total, ul;
		this.opt = $.extend(def, opt);
		total = this.opt.total;
		range = this.opt.range;
		current = this.opt.current;
		if (total < 1) total = 1;
		if (current < 1) current = 1;
		if (range > total) range = total;
		half = Math.ceil(range / 2);
		if (current - half < 0) {
			min = 1;
			max = range;
		} else if (current + half >= total) {
			min = total - range + 1;
			max = total;
		} else {
			min = current - half + 1;
			max = current + half;
		}
		ul = $('<ul/>');
		for (k = min; min <= max ? k <= max : k >= max; min <= max ? k++ : k--) {
			list = $('<li>').appendTo(ul);
			if (k === current) list.addClass('active');
			$('<a>').attr({
				'href': '#',
				'data-page': k
				}).text(k).appendTo(list);
			}
			divider = $('<li class="disabled"><a href="#">...</a></li>');
			if (min > 1) {
				if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {  
				} else {
					divider.prependTo(ul);
				}
				skip_prev = $('<li>').prependTo(ul);
				$('<a>').attr({
					'href': '#',
					'data-page': 1
				}).text('1').appendTo(skip_prev);
			}
			if (max < total) {
				if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {  
				} else {
					divider.clone().appendTo(ul);
				}
				skip_next = $('<li>').appendTo(ul);
				$('<a>').attr({
					'href': '#',
					'data-page': total
				}).text(total).appendTo(skip_next);
			}

			prev = $('<li class="prev" />');
			next = $('<li class="next" />');
			$('<a />').attr({
				'href': '#',
				'data-page': current - 1
			}).text(this.opt.prev).appendTo(prev);
			$('<a />').attr({
				'href': '#',
				'data-page': current + 1
			}).text(this.opt.next).appendTo(next);
			if (current <= 1) prev.addClass('disabled');
			if (current >= total) next.addClass('disabled');
			ul.prepend(prev).append(next);
			return ul;
		};
	
		return Pagination;

	})();

	$(function() {
		var ui;
		return ui = new UI({
			'dmm': new DMM({
			'api_id': '4SXuRVCfsFcu9kW2GrYw',
			'affiliate_id': 'dmmsumpleban-990',
			'form': $('#search')
		}),
		'table': $('#items'),
		'template': $('#template-item'),
		'alert': $('#alert')
		});
	});

}).call(this);

// 検索押下時に設定
function SetParam(){
	$('input[name=service]').val($('select[name=selservice]').val());
	$('input[name=floor]').val($('select[name=selfloor]').val());
	$('input[name=sort]').val($('select[name=selsort]').val());
	$('input[name=hits]').val($('select[name=selhits]').val());
	$('input[name=stock]').val($('select[name=selstock]').val());
	$('input[name=offset]').val('1');
	$('input[name=keyword]').val($('input[name=txtkeyword]').val());
}

// サンプル動画取得
function MovieStart(id,url){
	
	if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {  
		
		var content ="";
		$.ajax({  
			data: {
				url: url
			},
			url: 'http://sugusokosample.com/search/file_get_contents.php',  
			type: 'GET',  
			success: function(data) {  
				content = $(data).find('.play-btn').attr('href');
				if(content == '' || content == 'undefine'){
					$("#spanErr_" + id).html("<p class=\"colorRed\">スマホでは見れないっぽい</p>");
					$("#spanErr_" + id).show("slow");
				} else {
					window.location.href = content;
				}
			},
			error: function(xhr, textStatus, errorThrown){
				$("#spanErr_" + id).html("<p class=\"colorRed\">スマホでは見れないっぽい</p>");
				$("#spanErr_" + id).show("slow");
			}
		});
	}else {
		var pcelm1 = "<div class=\"alert alert-success\"><a class=\"close\" href=\"javascript:void(0)\" onclick=\"MovieClear('" + id + "')\">×</a><br /><iframe width=\"560\" height=\"360\" src=\"http://www.dmm.co.jp/litevideo/-/part/=/affi_id=dmmsumpleban-990/cid=";
		var pcelm2 = "/size=560_360/\" scrolling=\"no\" frameborder=\"0\" allowfullscreen></iframe></div>";
		$("#movie_" + id).show("slow");
		$("#movie_" + id).html(pcelm1 + id + pcelm2);
	} 
}

// サンプル動画クリア
function MovieClear(id){
	$("#movie_" + id).hide("slow");
	$("#movie_" + id).html("");
}

// ツイート
function ClickTw1(id){
	var afiId = $('input[name=txtafiId]').val();
	var url = $("#hdnTwUrl_" + id).val();
	var title = $("#hdnTwTitle_" + id).val();
	window.open(url + "http://sugusokosample.com/+" + encodeURIComponent(title));
}

// ツイート
function ClickTw(id){
	var afiId = $('input[name=txtafiId]').val();
	var url = $("#hdnTwUrl_" + id).val();
	var title = $("#hdnTwTitle_" + id).val();
	var url2 = url.replace('dmmsumpleban-990', afiId);
	window.open(url2 + "http://sugusokosample.com/+" + encodeURIComponent(title));
}

function tw(url){
	window.open(url, null, "menubar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes" );
}
// 一括ツイート
function IkkatuTweet1(){
	var baseUrl = "http://twitter.com/share?url=[$1]&text=[$2]";
	var afiId = $('input[name=txtafiId]').val();
	$("#items tr td.image a[rel=bookmark]").each(function(i){
		var title = "http://sugusokosample.com/+" + encodeURIComponent($(this).attr("title"));
		var url3 = baseUrl.replace('[$1]', $(this).attr("href"));
		var url4 = url3.replace('[$2]', title);
		if(i > 0){
			setTimeout("tw('" + url4 +"');", i * 3000);
		} else {
			window.open(url4, null, "menubar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes" );
		}
	});
}

// 一括ツイート
function IkkatuTweet(){
	var baseUrl = "http://twitter.com/share?url=[$1]&text=[$2]";
	var afiId = $('input[name=txtafiId]').val();
	$("#items tr td.image a[rel=bookmark]").each(function(i){
		var title = "http://sugusokosample.com/+" + encodeURIComponent($(this).attr("title"));
		var url2 = $(this).attr("href").replace('dmmsumpleban-990', afiId);
		var url3 = baseUrl.replace('[$1]', url2);
		var url4 = url3.replace('[$2]', title);
		if(i > 0){
			setTimeout("tw('" + url4 +"');", i * 3000);
		} else {
			window.open(url4, null, "menubar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes" );
		}
	});
}

