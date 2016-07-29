const musicService = require('../service/music');
const settings = require('../store/settings');
const player = require('../store/player');

module.exports = {
    data(){
        return {
            songs: [],
            pageIndex: 1,
            totalPage: 1
        }
    },
    methods:{
        play(src){
            player.play(src);
        }
    },
    route: {
        data({next}){
            musicService.search({s: this.$route.params.name}).then(function (data) {
                console.log(data);
                next({
                    songs: data.result.songs,
                    totalPage: Math.ceil(data.result.songCount / settings.limit)
                });
            });
        }
    }
};