require("dotenv").config();
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require("./utils/users");

const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const server = http.createServer(app);
const io = socketio(server);
const chatbot = require("./CHATBOT_SERVICE/chatbot");

// Requiring route
const indexRoutes = require("./routes/index");

// DB CONNECTION
mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to DB!"))
    .catch(error => console.log(error.message));


//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/client'));
// use indexRoutes
app.use(indexRoutes);

const botName = "TvGram Bot";

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
        // pass the msg to chatbot service
        chatbot(msg, user.username).then(result => {
            // emit chatMessage to frontend
            io.to(user.room).emit("message", formatMessage(result.user, result.message));
        })
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