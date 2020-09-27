var http = require("http");
var express = require("express");
var socketio = require("socket.io");
var formatMessage = require("./assets/messages");
var { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require("./assets/users");


var app = express();
var server = http.createServer(app);
var io = socketio(server);
var randomColor = require("randomcolor");
var uuid = require("uuid");

//middlewares
app.use(express.static(__dirname + '/client'));

var botName = "TvGram Bot";

// Run when client connects
io.on('connection', socket => {
    // Run when user join a room
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to TvGram!"));

        // Broadcast to everyone when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen for chatMessage 
    socket.on("chatMessage", msg => {
        const user = getCurrentUser(socket.id);
        // emit chatMessage to frontend
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    // Run when client disconnects
    socket.on("disconnect", () => {
        const user = userLeaves(socket.id);

        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
});

//Listen on port 5000
server.listen(process.env.PORT || 5000, () => {
    console.log("Server is running")
});