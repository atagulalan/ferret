const { execFile } = require('child_process');
const { showIPs } = require('./src/ip');
const express = require('express');
const socketIO = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 4544;
const INDEX = path.join(__dirname, './public');
const DEBUG = true;

// Start server
const server = express()
    .use(express.static(INDEX))
    .listen(PORT);

const io = socketIO(server);

io.on("connection", function (socket) {
    socket.on("join", function (ferret) {
        DEBUG && console.log(ferret + " connected.");
        socket.join(ferret)
        socket.on(1, moveCursor);
        socket.on(2, mouseClick);
        socket.on('disconnect', function () { DEBUG && console.log(ferret + " disconnected.") });
    })
});

function mouse(...args){
    execFile('win32/nircmd.exe', args);
}

var moveCursor = function (c) {
    DEBUG && console.log("move", c[0], c[1]);
    mouse('movecursor', c[0], c[1]);
}

var mouseClick = function () {
    DEBUG && console.log("left click");
    mouse('sendmouse', 'left', 'click');
}

//Show IP's and ports to user
showIPs(PORT);