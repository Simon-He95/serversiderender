服务端渲染ssr
基于webpack的plugin：
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
通过本地环境变量，将entry指向应用程序的server/client文件
const target = TARGET_NODE ? 'server' : 'client'
entry：`./src/entry-${target}.js`,

app.js 作为一个工厂函数return {app,router},因为在服务端渲染，每一个用户需要对应一个独立的vue实例和router和vuex，需要改变原本的export的方式为funciton，再引入到app中通过工厂函数暴露出来
entry-server是等待用户输入url，服务端接收url，去执行拿到context,然后结构拿到app的router，在客户端去router.push(context.url),来跳转对应的服务端收到的页面，同时等待页面完成加载，router.onReady(),成功后resolve，因为中间可能存在异步，所以return的是一个promise对象路由成功加载后resolve()
entry-client客户端结构app的app,router，在router.onReady完成的回调中去执行挂载vue的app实例到#app上
npm i cross-env是一个跨平台的打包脚本
    "scripts": {
        "build:client": "vue-cli-service build",
        "build:server": "cross-env WEBPACK_TARGET=node vue-cli-service build --mode server",
        "build": "npm run build:server && npm run build:client"
    },
基于webpack打包执行npm run build 执行两次打包，生产dist/server和dist/client打包产物

server/vue-ssr-server-bundle.json会被用来创建成一个bundle的renderer,同时会需要一个宿主模板来渲染服务端返回的静态html结合dist/client中的js文件形成的spa的html页面，
并且在这个html页面需要一个规定的服务端占位符：<!--vue-ssr-outlet-->
const serverBundle = require('../dist/server/vue-ssr-server-bundle.json')
const renderer = createBundleRenderer(serverBundle, {
        runInNewContext: false,
        template: fs.readFileSync('../public/index.temp.html', 'utf-8'), // 需要一个宿主模板,所以需要在dist/public/建立一个index.temp.html的文件,需要在body中加入一个特殊的服务端占位符： <!--vue-ssr-outlet-->
        clientManifest // client/vue-ssr-client-manifest.json
    }) // 使用的webpack打包出的服务端包

client/vue-ssr-client-manifest.json作为bundle的renderer的参数
const clientManifest = require('../dist/client/vue-ssr-client-manifest.json') // 使用webpack打包出的客户端包

// 需要一个中间件处理静态文件请求 => spa
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

