let socket = io();      //init socketio
let periodicly = false; //sets response frequency
let period = 100;       //ms
let move = [0, 0];      //if periodicly, store all moves

//JOIN FERRET
socket.emit("join", "ferret");

//IF PERIODICLY, SET INTERVAL
if (periodicly) setInterval(function () { if (move[0] || move[1]) socket.emit("move", [move[0], move[1]]); move[0] = move[1] = 0 }, period);

//WAIT FOR LOAD
window.onload = function () {
    let tsx = 0;
    let tsy = 0;
    let touchpad = document.querySelectorAll("#touchpad")[0];
    touchpad.addEventListener('touchstart', function (e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            tmx = tsx = e.changedTouches[0].pageX
            tmy = tsy = e.changedTouches[0].pageY
            console.log("ts", tsx, tsy)
        }
    }, false)
    touchpad.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            let difX = Math.round(e.changedTouches[0].pageX - tmx);
            let difY = Math.round(e.changedTouches[0].pageY - tmy);
            console.log("tm", difX, difY);
            tmx = e.changedTouches[0].pageX
            tmy = e.changedTouches[0].pageY
            moveCursor(difX, difY);
        }
    }, false)
    touchpad.addEventListener('touchend', function (e) {
        e.preventDefault();
        if (e.touches.length === 0) {
            if (tsx === tmx && tsy === tmy) {
                console.log("miracle");
                mouseClick();
            }
            tsx = tsy = tmx = tmy = 0;
        }
    }, false)
}

function moveCursor(x, y) { 
    if (periodicly) {
        move[0] += x; 
        move[1] += y;
    } else if (x || y) {
        socket.emit(1, [x, y]);
    }
}

function mouseClick() { 
    socket.emit(2);
}