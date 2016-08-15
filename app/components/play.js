const cache = require('../store/cache');
const player = require('../service/player');
const musicService = require('../service/music');
module.exports = {
    data(){
        return {
            song: cache.curSong,
            showLyric: false,
            lyric: '',
            lyricTimers: []
        }
    },
    computed:{
        isStop(){
            return cache.isStop;
        }
    },
    methods:{
        parseLyric(lyricString){
            let start = Date.now();
            let canSync = /\d+\:\d+\.\d+/.test(lyricString);
            let self = this;
            let curTime = Math.ceil(player.audio.currentTime * 1000);

            self.lyricTimers.length && self.lyricTimers.forEach((item)=>clearTimeout(item));
            if(canSync){
                lyricString = lyricString.trim().split(/\n/);

                for(var i = 0, len = lyricString.length; i < len; i++){
                    var item = lyricString[i],
                        timeArr = item.match(/\d+\:\d+\.\d+/g) && item.match(/\d+\:\d+\.\d+/g)[0].split(/\:|\./),
                        timer = item.match(/\d+\:\d+\.\d+/g) ? (Number(timeArr[0]) * 60 * 1000 + Number(timeArr[1]) * 1000 + Number(timeArr[2])) : 0,
                        str = item.split(/\[\d+\:\d+\.\d+\]/)[1] ? item.split(/\[\d+\:\d+\.\d+\]/)[1].trim() : (item.split(/\[\d+\:\d+\.\d+\]/)[0] && item);
                    self.lyricTimers.push(setTimeout((function (s) {
                        return function () {
                            self.lyric = s;
                        }

                    })(str), timer - curTime - (Date.now() - start))); //减小时间误差
                }
            } else {
                self.lyric = `这个歌词无法同步播放, 只好请直接看了.\n${lyricString}`;
            }
        }
    },
    route: {
        data({next}){
            musicService.getLyric({id: this.song.id}).then((res) => {
                res['nolyric'] || !(res['lrc'] && res['lrc']['lyric']) ? (this.lyric = '这里不会轻易显示歌词.') : this.parseLyric(res['lrc']['lyric']);
            });
            next();
        }
    },
    ready(){
        if(this.song.mp3Url){
            player.spectrum();
        }
    }
};