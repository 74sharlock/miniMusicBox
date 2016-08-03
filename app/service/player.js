const spectrumAnalyzer = require('./spectrum-analyzer');

module.exports = {
    play(name){
        name && spectrumAnalyzer.init(name);
        return this;
    },
    spectrum(){
        spectrumAnalyzer.drawSpectrum();
        return this;
    },
    stop(){
        spectrumAnalyzer.stop();
        return this;
    },
    goOn(){
        spectrumAnalyzer.goOn();
        return this;
    }
};