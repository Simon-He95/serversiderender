// 挂载、激活app
import createApp from './app.js'

const { app, router } = createApp()
router.onReady(() => { // 服务端返回给我们html之后，客户端去挂载到#app标签上
    app.$mount('#app')
})