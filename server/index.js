const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

app.use(cors());



//creating the server
const serverIP = "localhost"
const server = http.createServer(app);
const dbURL = "mongodb://localhost:27017/Chat";
mongoose
    .connect(dbURL)
    .then(() => console.log("connected to DB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err))


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const roomSchema = new mongoose.Schema({
    roomName: { type: String, unique: true, required: true },
    roomOwner: { type:String, required:true },
    messageLog: [{
        room: { type: String, required: true },
        author: { type: String, required: true},
        message: { type: String, required: true },
        time: { type: String, required: true }
    }]
});

const _User = mongoose.model("user", userSchema);
const _Room = mongoose.model("room", roomSchema);

//server query
const io = new Server(server, {
    cors: {
        origin: "http://" + serverIP + ":3000",
        methods: ["GET", "POST"],
    },
});

const sendlog = async (data, socket) => {
    try {
        await mongoose.connect(dbURL); // Connect to MongoDB

        const Log = await getLog(data.room); // Wait for the promise to resolve

        if (Log) {
            Log.map((message) => {
                var msg = {
                    room: message.room,
                    author: message.author,
                    message: message.message,
                    time: message.time,
                }
                console.log("sent?")
                socket.emit("receive_message", msg);
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function getLog(room) {
    try {
        const roomdata = await _Room.findOne({ roomName: room });
        if (!roomdata) {
            return null;
        }
        console.log(roomdata.messageLog)
        return roomdata.messageLog;
    } catch (error) {
        console.error("Error getting message log for room:", error);
        throw error;
    }
}

async function logRoomMessages(data,user=null) {
    try {
        const existingRoom = await _Room.findOne({ roomName: data.room });
        if (!existingRoom) {
            await _Room.create({ roomName: data.room, roomOwner: user, messageLog: [data] });
            console.log("Room created:", data.room);
        } else {
            console.log("Room already exists:", data.room);
            await _Room.updateOne(
                { roomName: data.room },
                { $push: { messageLog: data } }
            );
            console.log("Data appended to existing room:", data.room);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}




//listening to FrontEnd events
io.on("connection", (socket) => {
    console.log("User Connected : " + socket.id);

    socket.on("signup", (data) => {
        console.log(data); // Logging the received data

        userData = {
            username: data.username,
            password: data.password,
        };

        mongoose
            .connect(dbURL)
            .then(() => {
                console.log("Connected to MongoDB");
                _User.insertMany(userData)
                    .then(() => {
                        console.log("inserted a user successfully.");
                        socket.emit("valid");
                    })
                    .catch((error) => {
                        console.log(error);
                        socket.emit("notvalid");
                    });
            })
            .catch((err) => console.error("Error connecting to MongoDB:", err));
    });

    socket.on("login", (data) => {
        mongoose.connect(dbURL).then(() => {
            console.log("Connected to MongoDB");
            _User.findOne({ username: data.userName, password: data.password })
                .then((user) => {
                    if (user) {
                        console.log("user logged in: ", socket.id);
                        socket.emit("logged");
                    } else {
                        console.log(user);
                        console.log("User not found: ", user);
                        socket.emit("loggedError");
                    }
                })
                .catch((error) => {
                    console.error("Error finding user:", error);
                    socket.emit("loggedError");
                });
        });
    });

    socket.on("get_rooms", () => {
        mongoose.connect(dbURL).then(() => {
            _Room.find({}, 'roomName')
                .then(room_list => {
                    for (let i = 0; i < room_list.length; i++) {
                        let room = room_list[i].roomName;
                        let activeUserCount = 0;

                        if (room && room.size > 0) {
                            room.forEach((_, socketId) => {
                                let socket = io.sockets.sockets.get(socketId);
                                if (socket && socket.connected) {
                                    activeUserCount++;
                                }
                            });
                        }
                        let roomInfo = {
                            room: room,
                            count: activeUserCount,
                        };
                        console.log(roomInfo);
                        io.emit("room_update", roomInfo);
                    }
                    
                })
                .catch(err => {
                    console.error("Error finding room:", err);
                });
        })
    })

    socket.on("join_room", (data) => {

        if (data.currentRoom !== "") {
            socket.leave(data.currentRoom);

            var msg1 = {
                room: data.currentRoom,
                author: "sys",
                message: data.userName + " left the room.",
                time:
                    String(new Date(Date.now()).getHours()).padStart(2, "0") +
                    ":" +
                    String(new Date(Date.now()).getMinutes()).padStart(2, "0"),
            }

            logRoomMessages(msg1);
            io.in(data.currentRoom).emit("receive_message", msg1);
            console.log("user (" + socket.id + ") left room : " + data.currentRoom)
        }


        socket.join(data.room);

        const room = io.sockets.adapter.rooms.get(data.room);

        let activeUserCount = 0;

        if (room && room.size > 0) {
            room.forEach((_, socketId) => {
                const socket = io.sockets.sockets.get(socketId);
                if (socket && socket.connected) {
                    activeUserCount++;
                }
            });
        }

        const lastRoom = io.sockets.adapter.rooms.get(data.currentRoom);

        let activeUserCountLastRoom = 0;

        if (lastRoom && lastRoom.size > 0) {
            lastRoom.forEach((_, socketId) => {
                const socket = io.sockets.sockets.get(socketId);
                if (socket && socket.connected) {
                    activeUserCountLastRoom++;
                }
            });
        }

        var roomInfo = {
            room: data.room,
            count: activeUserCount,
        };

        io.emit("room_update", roomInfo);

        var roomInfo = {
            room: data.currentRoom,
            count: activeUserCountLastRoom,
        };

        io.emit("room_update", roomInfo);


        var msg = {
            room: data.room,
            author: 'sys',
            message: data.userName + " joined the room.",
            time:
                String(new Date(Date.now()).getHours()).padStart(2, "0") +
                ":" +
                String(new Date(Date.now()).getMinutes()).padStart(2, "0"),
        }

        logRoomMessages(msg,data.userName);        
        console.log("user (" + socket.id + ") joined room : " + data.room);

        mongoose.connect(dbURL).then(
            ()=>{
                sendlog(data, socket).then(
                    () => {
                        io.in(data.room).emit("receive_message", msg);
                    }
                )
            }
        ).catch((error)=>{
            console.error(error);
        })
        



    });

    socket.on("send_message", (data) => {
        console.log(data);
        console.log(socket.rooms);

        logRoomMessages(data)

        io.in(data.room).emit("receive_message", data);
    });

    socket.on("log-out", (data) => {
        if (data.currentRoom !== "") {
            socket.leave(data.currentRoom);

            var msg1 = {
                room: data.currentRoom,
                author: 'sys',
                message: data.userName + " left the room.",
                time:
                    String(new Date(Date.now()).getHours()).padStart(2, "0") +
                    ":" +
                    String(new Date(Date.now()).getMinutes()).padStart(2, "0"),
            }

            io.in(data.currentRoom).emit("receive_message", msg1);
            logRoomMessages(msg1)
            console.log("user (" + socket.id + ") left room : " + data.currentRoom)
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected : " + socket.id);
    });
});

server.listen(3001, () => {
    console.log("SERVER RUNNING");
});
