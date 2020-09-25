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


//socket.io instantiation
const io = require("socket.io")(server);

const users = [];
const connnections = [];

//listen on every connection
io.on('connection', (socket) => {
    console.log('New user connected');
    //add the new socket to the connections array
    connnections.push(socket)
    //initialize a random color for the socket
    let color = randomColor();

    //Set the first username of the user as 'Anonymous'
    socket.username = 'Anonymous';
    socket.color = color;

    //listen on change_username
    socket.on('change_username', data => {
        let id = uuid.v4(); // create a random id for the user
        socket.id = id;
        socket.username = data.nickName;
        users.push({ id, username: socket.username, color: socket.color });
        updateUsernames();
    })

    //update Usernames in the client
    const updateUsernames = () => {
        io.sockets.emit('get users', users)
    }

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: socket.username, color: socket.color });
    })

    //listen on typing
    socket.on('typing', data => {
        socket.broadcast.emit('typing', { username: socket.username })
    })

    //Disconnect
    socket.on('disconnect', data => {

        if (!socket.username)
            return;
        //find the user and delete from the users list
        let user = undefined;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === socket.id) {
                user = users[i];
                break;
            }
        }
        users.splice(user, 1);
        //Update the users list
        updateUsernames();
        connnections.splice(connnections.indexOf(socket), 1);
    })
})