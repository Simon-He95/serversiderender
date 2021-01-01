// 需要的插件：vue-server-renderer、webpack-node-externals、lodash.merge、cross-env、mini-css-extract-plugin
// cross-env是一个跨平台的打包脚本
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const nodeExternals = require('webpack-node-externals')
    // 每一次的打包清除上一次的打包中的dist文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const merge = require('lodash.merge')
    // 环境变量，决定了将来打包入口是客户端还是服务端
const TARGET_NODE = process.env.WEBPACK_TARGET === 'node'
const target = TARGET_NODE ? 'server' : 'client'

module.exports = {
    css: {
        extract: false,
    },
    outputDir: './dist/' + target,
    configureWebpack: () => ({
        // 将entry指向应用程序的server/client文件
        entry: `./src/entry-${target}.js`,
        // 对bundle.js提供sourceMap支持
        devtool: 'source-map',
        // 允许webpack以node适用方式处理动态导入（dynamic import）
        // 并且还会在编译vue组件时告知‘vue-loader'，输送面向服务器代码（server-oriented code）
        target: TARGET_NODE ? "node" : "web",
        node: TARGET_NODE ? undefined : false,
        output: {
            // 此处告知 server bundle使用 Node 风格到处模块
            libraryTarget: TARGET_NODE ? 'commonjs2' : undefined,
        },
        // 外置化应用程序依赖模块。可以使用服务器构建速度更快，并生成较小的bundle文件
        externals: TARGET_NODE ?
            nodeExternals({
                // 不要外置化 webpack 需要处理的依赖模块
                // 可以在这里添加更多的文件类型。例如，未处理*.vue原始文件
                // 你还应该将修改 `global`(例如 polyfill)的依赖列入白名单
                allowlist: [/\.css$/] // whitelist 变为了 allowlist
            }) : undefined,
        optimization: {
            splitChunks: TARGET_NODE ? false : undefined
        },
        // 这是将服务器的整个输出构建为单个JSON文件的插件。
        // 服务端默认文件名为'vue-ssr-server-bundle.json'
        plugins: [TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin(), new CleanWebpackPlugin()]
    }),
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => {
                merge(options, {
                    optimizeSSR: false
                })
            })
    }
}