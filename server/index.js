// 这种方式是有局限的，传统的通过node来解决可以通过动态的路由，获取url最后的去查找对应的.vue文件template来加载
// 但是我们想通过vue的方式，使用vue-router来匹配这个template，这样有会出现一个问题
//原本vue是一个spa单页面应用，我们的路由是直接export default new Router，现在放到了服务端去渲染，可能会产生大量的用户同时去访问，来创建，每一次创建都会去用到这个router
// 所以需要通过function return new Router的方式来，让每一个用户都对应一个独立的vue实例和一个独立的router实例，防止他们共享一个地址，把router的数据污染了
// 所以这样对服务器的压力就会很大，在服务端每一个用户需要一个独立的vue实例和一个独立的router实例，这样对服务器的cpu内存的要求会大大提高
// nodejs服务器
const express = require('express')
const Vue = require('vue')
const fs = require('fs')


// 创建express和vue的实例
const app = express() // express是一个工厂函数的实例不需要new
    // 创建渲染器,将vue实例直接传入给renderer中，会直接将实例转化成html页面
const { createBundleRenderer } = require('vue-server-renderer')
const serverBundle = require('../dist/server/vue-ssr-server-bundle.json')
const clientManifest = require('../dist/client/vue-ssr-client-manifest.json') // 使用webpack打包出的客户端包
const renderer = createBundleRenderer(serverBundle, {
        runInNewContext: false,
        template: fs.readFileSync('../public/index.temp.html', 'utf-8'), // 需要一个宿主模板,所以需要在dist/public/建立一个index.temp.html的文件,需要在body中加入一个特殊的服务端占位符： <!--vue-ssr-outlet-->
        clientManifest
    }) // 使用的webpack打包出的服务端包


// 需要一个中间件处理静态文件请求
app.use(express.static('../dist/client', { index: false }))

// 将路由的处理全部交给vue
app.get('*', async(req, res) => {
    try {
        // 获取当前的url
        const context = {
            url: req.url,
            title: 'ssr test'
        }
        const html = await renderer.renderToString(context) // 是一个异步，会返回一个promise,原本使用createRenderer需要接受vue实例的template，现在使用bundleRenderer直接传入context即可
        console.log(html)
        res.send(html)
    } catch (error) {
        res.status(500).send('服务器内部错误')
    }
})

app.listen(3000, () => {
    console.log('服务器启动成功')
})