const musicService = require('../service/music');
const player = require('../service/player');
const cache = require('../store/cache');

module.exports = {
    data(){
        return {
            songs: [],
            pageIndex: 1,
            totalPage: 0
        }
    },
    methods:{
        play(song, index){
            cache.curSong = song;
            cache.curPlayIndex = index;
            cache.curPlayList = this.songs;
            player.play(cache.curSong.mp3Url);
            cache.playing = true;
            cache.isStop = false;
        }
    },
    route: {
        data({next}){
            musicService.search({s: this.$route.params.name, limit: cache.limit}).then(function (data) {
                next({
                    songs: data.result.songs,
                    totalPage: Math.ceil(data.result.songCount / cache.limit)
                });
            });
        }
    }
};