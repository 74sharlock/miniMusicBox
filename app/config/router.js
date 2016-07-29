const yes = true;
const no = false;
const {component} = require('../helpers');

const routerMap = {
    '/': {
        page: {
            modelName: 'home',
            pageTitle: '首页',
            priority: 0
        },
        component: component(require('../components/home'), 'home')
    }
};

module.exports = function (router) {
    router.map(routerMap);
};