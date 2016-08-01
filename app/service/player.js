const spectrumAnalyzer = require('./spectrum-analyzer');

module.exports = {
    play(name){
        name && spectrumAnalyzer.close() && spectrumAnalyzer.init(name);
        return this;
    }
};