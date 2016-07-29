const Vue = require('vue');
const VueRouter = require('vue-router');
const routerConfig = require('./config/router');
const {component} = require('./helpers');
const filters = require('./filters');
const appHeader = component(require('./components/header'), 'header');

Vue.use(VueRouter);

Object.keys(filters).forEach((key)=>{
    Vue.filter(key, filters[key]);
});


const router = new VueRouter({
    linkActiveClass: 'active'
});

let routerMap = {};

//component: component(require('../components/home'), 'home')
Object.keys(routerConfig).forEach((key)=>{
    let thisRouter = routerConfig[key];
    routerMap[key] = thisRouter;
    routerMap[key].component = component(require(`./components/${thisRouter.page.modelName}`), thisRouter.page.modelName);
});

router.map(routerMap);

router.start({
    components: {
        appHeader
    }
}, '#app'); 