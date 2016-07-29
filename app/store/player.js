const player = new Audio();

module.exports = {
    play(name){
        name && (player.src = name);
        player.oncanplay = function () {
            this.play();    
        };
        return player;
    }    
};