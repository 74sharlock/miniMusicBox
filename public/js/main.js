window.top.musicBox = (function () {
    if (window.Audio) {
        var audio = new Audio(),
            _songsList = {_default:[]}, // 播放列表
            _currentIndex, // 当前播放歌曲索引
            _currentPlayModel = 'default',
            _currentPlayList = '_default',
            _limit = 15, // 每页显示多少条目,
            _offset = 1, // 当前第几页,
            _totalPage = 1, //总共多少页
            _searchType = 1, //搜索目标(歌曲:1, 专辑:10, 歌手:100, 歌单:1000, 用户:1002, mv:1004, 歌词:1006, 主播电台:1009)
            _currentKeyword = '',
            _searchDisplayTable = [], // 缓存的一次搜索结果用于显示
            _searchDataCache = [], // 缓存的一次搜索结果用于显示
            _showLyric = true, //是否显示歌词
            _LyricTimers = [],
            _logStyle = 'font-size:14px;',
            _commandStyle = 'color: #fff;background-color: #ADB0BF;border-radius: .2rem;font-family: Menlo,Monaco,Consolas,"Courier New",monospace;padding: .2rem .4rem;font-size: 90%;line-height:2;',
            _mutedStyle = 'color: #818a91;',
            _signStyle = 'color: #d44950',
            _lyricStyle = 'color: #5B84B3;font-size:14px;',
            _sign = '♪'
            ;

        var _log = console.log.bind(console);
        var _table = console.table.bind(console);

        var _linkParser = function (url) {
            var a = document.createElement('a');
            a.href = url || window.location.href;
            return a;
        };

        var _getUrlParams = function (url, method) {
            var json = {}, a = _linkParser(url);
            method = method || 'search';

            if(a[method]){
                var queryArr = a[method].substr(1).split('&'), i = 0, l = queryArr.length;
                for(; i < l; i ++){
                    var items = queryArr[i].split('=');
                    json[items[0]] = items[1];
                }
            }

            return json;
        };

        var _getType = function (str) {
            return ({}).toString.call(str).replace(/^\[object\s|\]$/g, '').toLowerCase();
        };

        var _isFunction = function (f) {
            return _getType(f) === 'function';
        };

        var _isBoolean = function (b) {
            return _getType(b) === 'boolean';
        };

        var _isString = function (s) {
            return _getType(s) === 'string';
        };

        var _queryData = function (url, data, method, callback, needJson) {
            var dataString, key, val, xhr;
            dataString = '';
            if (_isFunction(method)) {
                needJson = _isBoolean(callback) ? callback : true;
                callback = method;
                method = 'post';
            }
            xhr = new XMLHttpRequest();
            xhr.onload = function() {
                if (_isFunction(callback)) {
                    return callback((_isString(xhr.responseText) && needJson === true ? JSON.parse(xhr.responseText) : xhr.responseText));
                }
            };
            xhr.open(method, url, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            for (key in data) {
                if(data.hasOwnProperty(key)){
                    val = data[key];
                    dataString += String(key) + '=' + String(val) + '&';
                }
            }
            return xhr.send(dataString);
        };

        var _parseLyric = function (lyricString) {
            var start = Date.now();
            var canSync = /\d+\:\d+\.\d+/.test(lyricString);
            _log('%c输入%cmusicBox.showLyric(false)%c来关闭歌词显示.', _mutedStyle, _commandStyle, _mutedStyle);

            _LyricTimers.forEach(function (item) {
                clearTimeout(item);
            });

            if(canSync){
                lyricString = lyricString.trim().split(/\n/);
                for(var i = 0, len = lyricString.length; i < len; i++){
                    var item = lyricString[i],
                        timeArr = item.match(/\d+\:\d+\.\d+/)[0].split(/\:|\./),
                        timer = Number(timeArr[0]) * 60 * 1000 + Number(timeArr[1]) * 1000 + Number(timeArr[2]),
                        str = item.split(/\[\d+\:\d+\.\d+\]/)[1].trim();
                    _LyricTimers.push(setTimeout((function (s) {

                        return function () {
                            _log('%c' + s, _lyricStyle);
                        }

                    })(str), timer - (Date.now() - start))); //减小时间误差
                }
            } else {
                _log('%c这个歌词无法同步播放, 只好请直接查看了. ' + _sign, _mutedStyle);
                _log('%c' + lyricString, _lyricStyle);
            }
        };

        audio.onplay = function () {
            return _log('%c开始播放了!', _mutedStyle);
        };

        audio.onpause = function () {
            return _log('%c' + _sign, _signStyle);
        };

        audio.search = function (keywords, backup) {
            _currentKeyword = keywords.trim();
            backup = backup || {};
            _queryData('/music/search', {
                s: _currentKeyword,
                limit: backup.limit || _limit,
                offset: backup.offset || _offset,
                type: backup['searchType'] || _searchType
            }, function (res) {
                var count = res.result['songCount'];
                _totalPage = Math.floor(count / _limit) + 1;
                _searchDataCache = res.result['songs'];
                _searchDisplayTable = [];
                _searchDataCache.forEach(function (item) {
                    _searchDisplayTable.push({
                        '音乐标题': item.name,
                        '歌手': item['artists'][0]['name'],
                        '专辑': item['album']['name'],
                        '时长': item.duration / 1000 + 's'
                    });
                });
                _table(_searchDisplayTable);
                _log('%c使用%cmusicBox.playThat(搜索结果列表的序号)%c播放音乐.' +
                    '\n\n一共搜索到' + count + '数据. 共' + _totalPage + '页. ' +
                    '当前第' + _offset + '页. ' +
                    '\n使用%cmusicBox.nextPage()%c来查看下一页.' +
                    '\n使用%cmusicBox.lastPage()%c来查看上一页.' +
                    '\n使用%cmusicBox.goPage(number)%c来查看指定页.'
                    , _mutedStyle, _commandStyle, _mutedStyle, _commandStyle, _mutedStyle, _commandStyle, _mutedStyle, _commandStyle, _mutedStyle);
            });

            _log('%c正在努力搜索音乐...', _mutedStyle);
            return _sign;
        };

        audio.goPage = function (n) {
            n = Number(n);
            if(isNaN(n)){
                return '请输入整数哦~';
            }
            if(n > _totalPage){
                return '最多只有' + _totalPage + '页啊, 亲~'
            }
            if(n === _offset){
                return '已经在第' + _offset + '页了, 亲~'
            }
            if(n <= 0){
                return '再往前已经没有数据了, 亲~'
            }
            _offset = n;
            return audio.search(_currentKeyword, {offset: n});
        };

        audio.nextPage = function () {
            return audio.goPage(_offset + 1);
        };

        audio.prevPage = function () {
            return audio.goPage(_offset - 1);
        };


        audio.showLyric = function (show) {
            if(!_isBoolean(show)){
                return '参数错误. 参数为false关闭歌词显示, 参数为true打开歌词显示.';
            }
            _showLyric = show;
            return (show ? '打开了' : '关闭了' ) + '歌词显示';
        };

        audio.mySongs = function () {
            _table(_songsList[_currentPlayList]);
            return '当前的播放列表是: ' + (_currentPlayList === '_default' ? '试听列表' : _currentPlayList);
        };

        audio.playThat = function (key) {

            if (!isNaN(Number(key))) {
                if (_searchDataCache[key]) {
                    audio.src = _searchDataCache[key]['mp3Url'];
                    _songsList._default.push(_searchDisplayTable[key]);
                    _currentIndex = key;
                    if(_showLyric){
                        _queryData('/music/lyric', {id: _searchDataCache[key]['id']}, function (res) {
                            res['nolyric'] || !(res['lrc'] && res['lrc']['lyric']) ? console.log('%c没有找到歌词...' + _sign, _mutedStyle) : _parseLyric(res['lrc']['lyric']);
                            audio.play();
                        });
                    } else {
                        audio.play();
                    }

                    _log('%c准备' + (_showLyric ? '歌词' : '播放') + '...', _mutedStyle);
                    return _sign;
                } else {
                    return '并没有找到对应的音乐.这个序号真的没有问题吗?'
                }

            } else {
                return "你应该输入一个正常的序号.";
            }

        };

        audio.readMe = function () {
            _log('%c欢迎使用sharlock的超迷你音乐盒:' +
                '\n1.使用%cmusicBox.search("歌曲名")%c[注意引号] 搜索音乐.' +
                '\n2.使用%cmusicBox.playThat(搜索结果列表的序号)%c播放音乐.' +
                '\n3.使用%cmusicBox.mySongs()%c查看我的音乐列表.' +
                '\n5.使用%cmusicBox.pause()%c暂停播放, 使用%cmusicBox.play()%c继续播放.' +
                '\n6.更多功能正在开发中, 敬请期待'
                ,_mutedStyle, _commandStyle, _mutedStyle, _commandStyle, _mutedStyle, _commandStyle, _mutedStyle, _commandStyle, _mutedStyle, _commandStyle, _mutedStyle);
            return _sign;
        };
        return audio;
    }
    return '你的浏览器并不支持这个音乐盒.';
})();
