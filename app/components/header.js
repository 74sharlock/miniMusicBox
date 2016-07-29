module.exports = {
    data(){
        return {
            keyword:''
        }
    },
    methods:{
        searchSongs(){
            this.keyword !== '' && this.$router.replace('/search/' + this.keyword);
        }
    }
};