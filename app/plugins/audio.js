const audio = new Audio;
const context = new AudioContext();
const analyser = context.createAnalyser();
const audioNode = context.createMediaElementSource(audio);

const analysis = function (arrayBuffer) {
    context.decodeAudioData(arrayBuffer, (buffer) => {
        //将音频节点与分析器连接
        audioNode.connect(analyser);

        //将分析器与destination连接，这样才能形成到达扬声器的通路
        analyser.connect(context.destination);

        //将上一步解码得到的buffer数据赋值给音频节点
        audioNode.buffer = buffer;

        //记录下时长
        this.duration = buffer.duration;

        //放!
        audio.src = this.src;
        audio.play();
        //音乐响起后，把analyser传递到另一个方法开始绘制频谱图了，因为绘图需要的信息要从analyser里面获取
        drawSpectrum(analyser);
    });
};

const drawSpectrum = function (analyser) {
    let canvas = document.querySelector('canvas');
    if(canvas){
        let parent = canvas.parentNode;
        canvas.width = parseInt(getComputedStyle(parent).width, 10) - 10;
        canvas.height = parseInt(getComputedStyle(parent).height, 10) - 20;
        let cwidth = canvas.width,
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
};

module.exports = {
    install(vue){
        vue.prototype.$audio = {
            src: '',
            duration: 0,
            progress: 0,
            useAnalyzer: true,
            on404(){},
            play(src){
                if(!src) return false;

                this.src = src;
                if(this.useAnalyzer){
                    let request = new XMLHttpRequest();
                    request.open('GET', src, true);
                    request.responseType = 'arraybuffer';
                    request.onload = () => {
                        switch (request.status){
                            case 200:
                                request.response && analysis.call(this, request.response);
                                break;
                            case  404:
                                this.on404();
                                break;
                        }

                    };
                    request.send();
                } else {
                    audio.src = this.src;
                    audio.play();
                    this.duration = audio.duration;
                }
            },
            pause(){
                audio.pause();
            },
            getCurrentTime(){
                return audio.currentTime;
            }
        };

        vue.mixin({
            create(){
                if (this.$options.hasOwnProperty("audio")) {
                    methods.forEach((m) => {
                        socket.on(m, function (){
                            if (self.$options.sockets.hasOwnProperty(m)) {
                                self.$options.sockets[m].apply(self, arguments);
                            }
                        });
                    });
                }
            }
        });
    }
};