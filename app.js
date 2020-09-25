var express = require("express");
var app = express();
var randomColor = require("randomcolor");
var uuid = require("uuid");

//middlewares
app.use(express.static(__dirname + '/client'));

//routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

//Listen on port 5000
server = app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running")
});