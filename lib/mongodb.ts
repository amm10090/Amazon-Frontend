// 这个文件只能在服务器端使用
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// 确保代码只在服务器端运行
if (typeof window !== 'undefined') {
    throw new Error(
        'lib/mongodb should only be used within API routes or server-side code.\n' +
        'For client-side code, use API routes instead.'
    );
}

const uri = process.env.MONGODB_URI;
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // 在开发模式下使用全局变量，这样热重载不会创建新的连接
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // 在生产环境中创建新的连接
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise; 