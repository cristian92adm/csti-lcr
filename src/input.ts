
import {Handler } from 'aws-lambda';
import type { RedisClientType } from 'redis'
import { createClient } from 'redis'
import {createRedisClient} from './database/config';

interface MyEvent {
    numberInput: string;
    case: Array<string>;
  }

export const saveInput:Handler = async (event, context) => {
    try {
        
        const requestBody = JSON.parse(event.body) as MyEvent;
        let valueObject = null
       
        let redisClient = createRedisClient()

        redisClient.on('error', err => console.log('Redis Client Error', err));

        await redisClient.connect();

        if(!requestBody.case || !requestBody.numberInput){
            valueObject = {message: "Set Case and NumberInput"}

        }else{

            await redisClient.set(requestBody.numberInput, JSON.stringify(requestBody.case));
            const value: string | null = await redisClient.get(requestBody.numberInput);
            await redisClient.disconnect();
            
            if(value){
                valueObject = requestBody
            }else{
                valueObject = "Key not found"
            }
        }
     
        return {
            statusCode: 200,
            body: JSON.stringify(valueObject)
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};