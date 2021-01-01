// 创建 vue实例
import Vue from 'vue'
import App from './App.vue'
import createRouter from './router/index'

export default function createApp() {
    const router = createRouter()
    const app = new Vue({
            router,
            render: h => h(App)
        })
        // 服务端渲染不需要挂载，因为返回的字符串，没有地方挂载直接渲染html
    return {
        app,
        router
    }
}