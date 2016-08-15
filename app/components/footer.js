const cache = require('../store/cache');
const spectrumAnalyzer = require('../service/spectrum-analyzer');
const playModel = require('../store/play-model');
const player = require('../service/player');

module.exports = {
    data(){
        return {
            cache,
            playModel,
            playInfo: spectrumAnalyzer.props,
            progress: 0,
            timer: null
        }
    },
    computed: {
        curSong(){
            return cache.curSong;
        },
        duration(){
            return this.playInfo.duration;
        },
        isStop(){
            return cache.isStop;
        }
    },
    ready(){
      this.$nextTick(function () {
          this.$watch('isStop', function (val) {
              if(!val){
                  this.timer && clearTimeout(this.timer);
                  this.getProgress();
              }
          });
      });
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
        },
        getProgress(){
            this.timer = setTimeout(()=>{
                let curTime = Math.ceil(player.audio.currentTime * 1000), duration = Math.ceil(player.audio.duration * 1000);
                this.$set('progress', (curTime / duration * 100).toFixed(3));

                if(curTime < duration){
                    this.getProgress();
                }
            }, 1000);
        }
    }
};