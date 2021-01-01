import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../components/Index.vue'
import Detail from '../components/Detail.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'index',
    component: Index,
}, {
    path: '/detail',
    name: 'detail',
    component: Detail,
}]

export default function createRouter() {
    return new VueRouter({
        mode: 'history',
        routes
    })
}