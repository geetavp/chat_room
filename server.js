const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store chat messages
const messages = []; // Array to store chat messages

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    console.log("New user connected");

    // Send existing messages to the new user
    socket.emit("loadMessages", messages);

    socket.on("newuser", function (username) {
        socket.broadcast.emit("update", `${username} joined the chat!`);
    });

    socket.on("exituser", function (username) {
        socket.broadcast.emit("update", `${username} left the chat.`);
    });

    socket.on("chat", function (message) {
        messages.push(message); // Save message to the array
        socket.broadcast.emit("chat", message);
    });

    socket.on("disconnect", function () {
        console.log("User disconnected");
    });
});

server.listen(5000, () => {
    console.log("Server is running on port 5000");
});
