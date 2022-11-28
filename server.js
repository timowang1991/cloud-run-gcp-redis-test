'use strict';
const express = require('express');
const redis = require('redis');
const IORedis = require('ioredis');
const { default: Redlock } = require('redlock');

const {
    REDISHOST = 'localhost',
    REDISPORT = 6378,
    REDISAUTH,
    REDISCA,
} = process.env;

const client = redis.createClient({
    socket: {
        host: REDISHOST,
        port: REDISPORT,
        tls: true,
        ca: REDISCA,
    },
    password: REDISAUTH,
});

client.on('error', err => console.error('ERR:REDIS:', err));
client.connect();

const app = express();


app.get('/', async (req, res) => {
    try {
        const visits = await client.incr('visits')
        res.send(`Visitor number: ${visits + 1}\n`);
    } catch (error) {
        console.error('client incr error:', error);
        res.status(500).send(error);
    }
});

// 
// ioredis
//

const ioredisClient = new IORedis({
    port: REDISPORT,
    host: REDISHOST,
    password: REDISAUTH,
    tls: {
        ca: REDISCA
    }
});

app.get('/ioredis', async (req, res) => {
    try {
        const visits = (+await ioredisClient.get('visits') || 0) + 1;
        await ioredisClient.set('visits', visits);
        res.send(`Visitor number: ${visits + 1}\n`);
    } catch (error) {
        console.error('ioredis error:', error);
        res.status(500).send(error);
    }
});

// 
// redlock
//

const redlock = new Redlock([ioredisClient], {
    retryCount: 0,
});

app.get('/redlock', async (req, res) => {
    let lock;
    try {
        lock = await redlock.acquire(['a'], 5000);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        res.send('You got lock');
    } catch (error) {
        console.error('redlock error', error);
        res.status(500).send(error);
    } finally {
        await lock.release();
    }
});

app.listen(8080);