module.exports = {
    methods: {
        iterator: function (array, loop) {
            let nextIndex = 0 ;
            return {
                next(){
                    loop === true && nextIndex === array.length && (nextIndex = 0);
                    return nextIndex < array.length ? {value: array[nextIndex++], done: false} : {done: true};
                }
            }
        }
    }
};