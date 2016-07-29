const Vue = require('vue');

module.exports = {
    component(obj, name){
        let tpl = document.querySelector(`template[data-ref="${name}"]`);
        tpl.parentNode.removeChild(tpl);
        obj = Object.assign({
            template: tpl.innerHTML
        }, obj);
        return Vue.extend(obj);
    }
};