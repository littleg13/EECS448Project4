/******************************************************************************/
var canvas;
var backgroundElem;
var ctx;
var width;
var height;
var tank = new TankSprite(5, 5, 0.0);
var interval;
var map = new Map();
map.tiles =
    [[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]].map(function (row) {
        return row.map(function (val) {
            if (val === 0)
                return new FloorTile();
            else
                return new WallTile();
        });
    });
var keys = {
    "ArrowUp": false,
    "ArrowDown": false,
    "ArrowLeft": false,
    "ArrowRight": false
};
var getContext = function (canvas) {
    var ctx = canvas.getContext("2d");
    if (ctx instanceof CanvasRenderingContext2D)
        return ctx;
};
var main = function () {
    canvas = document.getElementById("canvas");
    backgroundElem = document.getElementById("background");
    if (!(canvas instanceof HTMLCanvasElement))
        return;
    if (!(backgroundElem instanceof HTMLCanvasElement))
        return;
    ctx = getContext(canvas);
    bkg = getContext(backgroundElem);
    map.render(bkg);
    width = canvas.width;
    height = canvas.height;
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    ctx.scale(2, 2);
    interval = setInterval(loop, Math.floor(1000 / 64));
};
var loop = function () {
    processInput();
    render();
};
var processInput = function () {
    if (keys["ArrowUp"] || keys["w"]) {
        tank.moveForward(0.125);
    }
    else if (keys["ArrowDown"] || keys["s"]) {
        tank.moveBackward(0.125);
    }
    else if (keys["ArrowLeft"] || keys["a"]) {
        tank.rotateCCW();
    }
    else if (keys["ArrowRight"] || keys["d"]) {
        tank.rotateCW();
    }
    else if (keys[" "]) {
        console.log("fire");
    }
};
var keyDownHandler = function (evt) {
    keys[evt.key] = true;
    return;
};
var keyUpHandler = function (evt) {
    keys[evt.key] = false;
    return;
};
var render = function () {
    var tileDim = 20;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(-(tank.x * tileDim), -(tank.y * tileDim));
    ctx.drawImage(backgroundElem, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(width / 4, height / 4);
    ctx.rotate(tank.dir / 180.0 * Math.PI);
    tank.render(ctx);
    ctx.restore();
};
