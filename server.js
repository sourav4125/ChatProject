const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser , userLeave , getRoomUsers } = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

//this line runs when a client connects , this will listen to some kind of events i.e connection
io.on("connection", socket => {
    console.log("New Web socket Connection.....");//when ever a client connects , this piece of code will be executed

    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        //welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to chat cord."));
        //BroadCase when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat.`));//the difference between 
                                                                                                        //'socket.emit' and 'socket.broadcast.emit' is that ,
                                                                                                        // 'socket.broadcast.emit' will emits to 
                                                                                                        //everybody excepts the user that's 
                                                                                                        //connecting . we don't need to notify 
                                                                                                        //the user that's connecting that they 
                                                                                                        //are connecting
                                                                                                        //'socket.emit' will emit to the single 
                                                                                                        //user or a single client thats connecting
        
        //send users and room info
        io.to(user.room).emit("roomUsers" , {
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });

    //listen for chatMessage
    socket.on("chatMessage", msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));//emit this message back to the client / to every body
    });

    //runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat.`));//'io.emit' will emit everybody who ever left the chat
            //send users and room info
        io.to(user.room).emit("roomUsers" , {
            room:user.room,
            users:getRoomUsers(user.room)
        });
        }
    });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));