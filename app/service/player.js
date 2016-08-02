const spectrumAnalyzer = require('./spectrum-analyzer');

module.exports = {
    play(name){
        name && spectrumAnalyzer.init(name);
        return this;
    }
};