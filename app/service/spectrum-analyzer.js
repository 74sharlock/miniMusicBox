const cache = require('../data/settings.json');
const helpers = require('../helpers');
const {remote} = require('electron');
const audio = new Audio(); //这个是必须的 不用尝试使用audioBufferSourceNode. 我已经试过了, 那滋味...

module.exports = {
    canvasNode: null,
    context: null,
    analyser: null,
    audioNode: null,
    arrayBuffer: null,
    props:{
        src: '',
        duration: 0,
        currentTime: 0,
        status: 0,
        audio
    },
    init(src){
        this.close();
        this.props.src = src;
        this.play(src);
        return this;
    },
    analysis(arrayBuffer, time){
        this.arrayBuffer = arrayBuffer;
        this.context = new AudioContext();
        this.analyser = this.context.createAnalyser();
        this.audioNode = this.context.createMediaElementSource(audio);

        this.context.decodeAudioData(arrayBuffer, (buffer) => {
            //将音频节点与分析器连接
            this.audioNode.connect(this.analyser);

            //将分析器与destination连接，这样才能形成到达扬声器的通路
            this.analyser.connect(this.context.destination);

            //将上一步解码得到的buffer数据赋值给音频节点
            this.audioNode.buffer = buffer;

            //记录下时长
            this.duration = buffer.duration;

            //放!
            audio.src = this.props.src;
            audio.play();
            //音乐响起后，把analyser传递到另一个方法开始绘制频谱图了，因为绘图需要的信息要从analyser里面获取
            this.drawSpectrum(this.analyser);
            this.bindEvent();
        });
    },
    bindEvent(){
        console.log(audio.audioTracks);
        audio.onended = ()=>{
            this.autoPlay();
        }
    },
    play(url) {
        let request = new XMLHttpRequest(), that = this;
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        // When loaded decode the data
        request.onload = function () {
            switch (request.status){
                case 200:
                    request.response && that.analysis(request.response, that.currentTime);
                    break;
                case  404:
                    remote.dialog.showMessageBox({
                        title: '提示',
                        buttons: ['确定'],
                        message: '抱歉, 该资源已下架...'
                    });
                    break;
            }

        };
        request.send();
    },
    drawSpectrum(){
        let canvas = document.querySelector('canvas'), analyser = this.analyser;
        if(canvas){
            let parent = canvas.parentNode;
            canvas.width = parseInt(getComputedStyle(parent).width, 10) - 10;
            canvas.height = parseInt(getComputedStyle(parent).height, 10) - 20;
            let that = this,
                cwidth = canvas.width,
                cheight = canvas.height - 2,
                meterWidth = 10, //频谱条宽度
                gap = 2, //频谱条间距
                capHeight = 2,
                capStyle = '#fff',
                meterNum = 800 / (10 + 2), //频谱条数量
                capYPositionArray = [], //将上一画面各帽头的位置保存到这个数组
                ctx = canvas.getContext('2d'),
                gradient = ctx.createLinearGradient(0, 0, 0, cheight);
            gradient.addColorStop(1, '#0f0');
            gradient.addColorStop(0.5, '#ff0');
            gradient.addColorStop(0, '#f00');
            var drawMeter = function() {
                var array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);

                var step = Math.round(array.length / meterNum); //计算采样步长
                ctx.clearRect(0, 0, cwidth, cheight);

                for (var i = 0; i < meterNum; i++) {
                    var value = array[i * step]; //获取当前能量值
                    if (capYPositionArray.length < Math.round(meterNum)) {
                        capYPositionArray.push(value); //初始化保存帽头位置的数组，将第一个画面的数据压入其中
                    }
                    ctx.fillStyle = capStyle;
                    //开始绘制帽头
                    if (value < capYPositionArray[i]) { //如果当前值小于之前值
                        ctx.fillRect(i *12, cheight-(--capYPositionArray[i]) < 0 ? 0 : (cheight-(--capYPositionArray[i])), meterWidth, capHeight);//则使用前一次保存的值来绘制帽头
                    } else {
                        ctx.fillRect(i * 12, (cheight - value) < 0 ? 0 : (cheight - value), meterWidth, capHeight); //否则使用当前值直接绘制
                        capYPositionArray[i] = value;
                    }
                    //开始绘制频谱条
                    ctx.fillStyle = gradient;
                    ctx.fillRect(i * 12, cheight - value + capHeight < 2 ? 2 : (cheight - value + capHeight) , meterWidth, cheight);
                }
                requestAnimationFrame(drawMeter);
            };
            requestAnimationFrame(drawMeter);
        }
    },
    close(){
        this.context && this.context.close();
        return this;
    },
    autoPlay(){
        let handles = {
            1(){
                cache.curPlayIndex = cache.curPlayIndex === cache.curPlayList.length - 1 ? 0 : cache.curPlayIndex + 1;
                cache.curSong = cache.curPlayList[cache.curPlayIndex];
                return cache.curSong.mp3Url;
            },
            2(){
                return this.props.src;
            },
            3(){
                cache.curPlayIndex = helpers.random(0, cache.curPlayList.length);
                cache.curSong = cache.curPlayList[cache.curPlayIndex];
                return cache.curSong.mp3Url;
            }
        };
        return this.init(handles[cache.playModel].call(this));
    },
    stop(){
        audio.pause();
    },
    goOn(){
        audio.play();
    }
};