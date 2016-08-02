const Vue = require('vue');

module.exports = {
    component(obj, name){
        let tpl = document.querySelector(`template[data-ref="${name}"]`);
        tpl && tpl.parentNode.removeChild(tpl);
        obj = Object.assign({
            template: tpl ? tpl.innerHTML : '<div></div>'
        }, obj);
        return Vue.extend(obj);
    },
    random: (n1, n2)=> Math.round(Math.random() * Math.abs(n1 - n2) + Math.min(n1, n2))
};