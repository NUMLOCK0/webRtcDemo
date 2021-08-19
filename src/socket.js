// module1.js
var express = require('express');
var expressWs = require('express-ws');

var router = express.Router();
expressWs(router);

const wsObj = {};

router.ws('/user/:id', function (ws, req){
    const id = req.params.id;
    wsObj[`${id}`] = ws;
 
    wsObj[id].on('message', function (msg) {
        try {
       const message = JSON.parse(msg)
        const fromId = id;
        console.log(id, 'id')
        console.log(message.toId, 'toId')
        if (fromId != message.toId && wsObj[`${message.toId}`]) {
            console.log(message, 'message')
            wsObj[`${message.toId}`].send(JSON.stringify( { fromId, data: message.data } ))
        }
        } catch (error) {
            console.log(error, 'error')
        }
        
    })
   
   })

module.exports = router;