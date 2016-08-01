const cache = require('../store/cache');
const player = require('../service/player');

module.exports = {
    data(){
        return {
            songs: cache.curSong
        }
    },
    ready(){
        if(cache.curSong.mp3Url){
            player.play(cache.curSong.mp3Url);
        }
    }
};