import AWS from 'aws-sdk';


import * as redis from 'redis';
import type { RedisClientType } from 'redis'
import { promisify } from 'util';
import dotenv from 'dotenv'
dotenv.config();

export function createRedisClient() {
  const client:RedisClientType = redis.createClient({url: process.env.REDIS_LOCAL_HOST});
  client.on('error', (error) => {
    console.error('Error en Redis:', error);
  });
  return client;
}

