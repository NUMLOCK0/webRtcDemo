const express = require("express")
const expressWs = require("express-ws")
const path = require('path')
const https = require("https")
const fs = require("fs")
const socket = require('./socket')
var os = require('os');
const app = express()

var privateKey  = fs.readFileSync('./path/to/private.pem', 'utf8');
var certificate = fs.readFileSync('./path/to/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

expressWs(app);

var httpsServer = https.createServer(credentials, app)

var SSLPORT = 30011;

app.use(express.static(path.join(__dirname, '/front')));
app.use('/ifc', socket);
app.set('views', path.join(__dirname, '/front/views'));
app.set('view engine', 'ejs');

app.get('/client', function(req, res) {
    const json = [{
      user: 'zhangsan',
      pass: 'lisi',
    }]
    res.render("client", {json: {arr: json}} );
  });

app.get('/server', function(req, res) {
    const json = [{
      user: 'zhangsan',
      pass: 'lisi222',
    }]
    res.render("server", {json: {arr: json}} );
  });

  app.get('*', function(req, res){
    res.send('<H1>what??? 404</H1>', 404);
  });


httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

// app.listen("", ()=>{
//     console.log("start in 30011")
// })