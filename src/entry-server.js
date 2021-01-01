// 渲染首屏
import createApp from './app'

export default context => { // context会在服务端，浏览器输入url时候将这个context传入
    return new Promise((resolve, reject) => {
        const { app, router } = createApp()
            // 进入首屏,context服务端会拿到你浏览器输入的url，知道你的首屏的地址，添加到客户端路由
        router.push(context.url)
        router.onReady(() => { // 因为onReady可能是一个异步的过程，所以使用的是promise，等到onReady才可以继续
            resolve(app)
        }, reject)
    })
}