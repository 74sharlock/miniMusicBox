const Vue = require('vue');
const VueRouter = require('vue-router');
const routerMap = require('./config/router');
const {component} = require('./helpers');
const filters = require('./filters');
const appHeader = component(require('./components/header'), 'header');

const musicService = require('./service/music');

Vue.use(VueRouter);

Object.keys(filters).forEach((key)=>{
    Vue.filter(key, filters[key]);
});


const router = new VueRouter({
    linkActiveClass: 'active'
});

routerMap(router);

router.start({
    components: {
        appHeader
    }
}, '#app'); 