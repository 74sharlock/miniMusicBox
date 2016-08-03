const cache = require('../store/cache');
const spectrumAnalyzer = require('../service/spectrum-analyzer');
const playModel = require('../store/play-model');
const player = require('../service/player');

module.exports = {
    data(){
        return {
            cache,
            playModel,
            playInfo: spectrumAnalyzer.props
        }
    },
    computed: {
        curSong(){
            return cache.curSong;
        },
        duration(){
            return this.playInfo.duration;
        }
    },
    methods: {
        togglePlay(){
            if(cache.playing){
                if(cache.isStop){
                    player.goOn();
                } else {
                    player.stop();
                }
                cache.isStop = !cache.isStop;
            }
        }
    }
};