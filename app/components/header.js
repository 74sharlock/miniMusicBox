const cache = require('../store/cache');

module.exports = {
    data(){
        return {
            keyword:this.$route.params.name || '',
            cache
        }
    },
    computed:{
        playing(){
            return cache.playing;
        },
        curSong(){
            return cache.curSong;
        }
    },
    methods:{
        searchSongs(){
            this.keyword !== '' && this.$router.replace('/search/' + this.keyword);
        }
    }
};