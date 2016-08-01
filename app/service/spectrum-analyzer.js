module.exports = {
    src: '',
    sourceNode: null,
    canvasNode: null,
    context: null,
    init(src){
        this.src = src;
        this.context = new AudioContext();
        this.sourceNode = this.context.createBufferSource();
        this.sourceNode.connect(this.context.destination);
        this.loadSound(src);
        return this;
    },
    loadSound(url) {
        console.log(this.sourceNode);
        let request = new XMLHttpRequest(), that = this;
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        // When loaded decode the data
        request.onload = function () {
            // decode the data
            that.context.decodeAudioData(request.response, function (buffer) {
                var analyser = that.context.createAnalyser();
                //将source与分析器连接
                that.sourceNode.connect(analyser);
                //将分析器与destination连接，这样才能形成到达扬声器的通路
                analyser.connect(that.context.destination);
                //将上一步解码得到的buffer数据赋值给source
                that.sourceNode.buffer = buffer;
                that.sourceNode.start(0);
                //音乐响起后，把analyser传递到另一个方法开始绘制频谱图了，因为绘图需要的信息要从analyser里面获取
                that.drawSpectrum(analyser);
            });
        };
        request.onerror = function (e) {
            console.log(e);
        };
        request.send();
    },
    drawSpectrum(analyser){
        let canvas = document.querySelector('canvas'), parent = canvas.parentNode;
        canvas.width = parseInt(getComputedStyle(parent).width, 10) - 10;
        canvas.height = 80;
        let cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 10, //频谱条宽度
            gap = 2, //频谱条间距
            capHeight = 2,
            capStyle = '#fff',
            meterNum = 800 / (10 + 2), //频谱条数量
            capYPositionArray = [], //将上一画面各帽头的位置保存到这个数组
            ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 78);
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
                    ctx.fillRect(i *12,cheight-(--capYPositionArray[i]),meterWidth,capHeight);//则使用前一次保存的值来绘制帽头
                } else {
                    ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight); //否则使用当前值直接绘制
                    capYPositionArray[i] = value;
                }
                //开始绘制频谱条
                ctx.fillStyle = gradient;
                ctx.fillRect(i * 12, cheight - value + capHeight, meterWidth, cheight);
            }
            requestAnimationFrame(drawMeter);
        };
        requestAnimationFrame(drawMeter);
    },
    close(){
        this.context && this.context.close();
        return this;
    }
};