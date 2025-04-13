// MongoDB连接配置模板文件
// 将此文件复制到lib/mongodb/config.js并根据需要修改

module.exports = {
    // MongoDB连接URI
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',

    // 数据库名称
    dbName: process.env.MONGODB_DB || 'oohunt',

    // 连接选项
    options: {
        // 自动重连
        autoReconnect: true,

        // 连接超时时间(ms)
        connectTimeoutMS: 10000,

        // Socket超时时间(ms)
        socketTimeoutMS: 45000,

        // 服务器选择超时时间(ms)  
        serverSelectionTimeoutMS: 10000,

        // 最大连接池大小
        maxPoolSize: 10,

        // 最小连接池大小
        minPoolSize: 1,

        // 重试写入
        retryWrites: true,

        // 当连接断开时是否自动重连
        useNewUrlParser: true,

        // 确保连接使用新的拓扑引擎
        useUnifiedTopology: true,

        // 读取首选项 (从主节点读取)
        // 可选值: 'primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'
        readPreference: 'primary',

        // 重试读取
        retryReads: true,

        // keepAlive选项 - 为了避免连接被关闭
        keepAlive: true,
        keepAliveInitialDelay: 300000, // 5分钟

        // 心跳频率 (ms)
        heartbeatFrequencyMS: 10000,

        // 超过此时间的连接空闲将被关闭
        maxIdleTimeMS: 30000,

        // 是否启用压缩
        compressors: ['none'], // 选择['zlib', 'snappy', 'zstd'] 或 ['none']

        // 开发环境下启用调试
        debug: process.env.NODE_ENV === 'development'
    }
}; 