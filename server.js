'use strict';
const redis = require('redis');
const express = require('express');

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT = process.env.REDISPORT || 6378;
const REDISAUTH = process.env.REDISAUTH;
const REDISCA = process.env.REDISCA;

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
    console.log('redis connected');
    try {
        const visits = await client.incr('visits')
        res.send(`Visitor number: ${visits + 1}\n`);
    } catch (error) {
        console.error('client incr error:', error);
        res.status(500).send(error);
    }
});

app.listen(8080);