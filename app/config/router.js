const yes = true;
const no = false;

module.exports = {
    '/': {
        page: {
            modelName: 'home',
            pageTitle: '首页',
            priority: 0
        }
    },
    '/search/:name': {
        page: {
            modelName: 'search',
            pageTitle: '发现',
            priority: 0
        }
    }
};