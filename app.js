const express = require('express');
const redis = require('redis');
const mysql = require('mysql');
const { promisify } = require("util");
const client = redis.createClient();
// const get = promisify(client.get).bind(client);
// const set = promisify(client.set).bind(client);
const app = express();
const port = 3000;

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'test',
    password : 'password',
    database : 'users'
});

client.on("error", (error) => {
    console.log(error);
});

app.get('/init', async (req, res) => {
    connection.connect((err) => {
        for(let i=0; i<500; i++) {
            connection.query('INSERT INTO data(username) VALUES("user' + i + '")');
        }
        res.status(200).send("completed");
        // connection.end();
    });
});

app.get('/users', async (req, res) => {
    connection.connect((err) => {
        client.get('users', (err, item) => {
            if(item === null) {
                connection.query('SELECT * FROM data', (err, rows) => {
                    if(err) {
                        console.log(err);
                        res.status(500);
                    }
                    client.set('users', JSON.stringify(rows));
                    res.status(200).send(rows);  
                    // connection.end();  
                });
            }
            else {
                res.status(200).send(JSON.parse(item));
                // connection.end();
            }
        });
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});