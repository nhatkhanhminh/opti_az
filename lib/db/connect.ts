import mongoose from 'mongoose';

interface IGlobalMongo {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongodb: IGlobalMongo | undefined;
}

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

export const connectDB = async () => {
  if (global.mongodb?.conn) {
    return global.mongodb.conn;
  }

  if (!global.mongodb) {
    global.mongodb = { conn: null, promise: null };
  }

  if (!global.mongodb.promise) {
    const opts = {
      bufferCommands: false,
    };
    global.mongodb.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    global.mongodb.conn = await global.mongodb.promise;
    // console.log('MongoDB connected successfully');
    return global.mongodb.conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    global.mongodb.promise = null;
    throw error;
  }
};

export const disconnect = async () => {
  if (global.mongodb?.conn) {
    await mongoose.disconnect();
    global.mongodb = undefined;
  }
};