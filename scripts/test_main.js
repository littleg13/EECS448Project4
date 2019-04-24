var gameview;
var background;
var tank = new Tank(5, 5, 0, "Test", "#c00", 100);
var bullets = [];
var interval;
var map = new Map();
var tileGen;
tileGen = [];
for (var row = 0; row < 50; row++) {
    tileGen[row] = [];
    for (var col = 0; col < 50; col++) {
        tileGen[row][col] = 0;
        if (row == 0 || col == 0 || row == 49 || col == 49)
            tileGen[row][col] = -1;
        if (((row + col) * (row - col) + 1) % 35 == 0)
            tileGen[row][col] = -1;
    }
}
map.tiles = tileGen.map(function (row) {
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
var main = function () {
    gameview = new Layer("game", 800, 800);
    background = new Layer("background", map.tiles.length * 40, map.tiles.length * 40);
    gameview.attachToParent(document.getElementById("visible"));
    background.attachToParent(document.getElementById("hidden"));
    background.drawItem(map);
    tank.addToSidebar(document.getElementById("sidebar"));
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    interval = setInterval(loop, Math.floor(1000 / 64));
};
var loop = function () {
    render();
    processInput();
};
var processInput = function () {
    if ((keys["ArrowUp"] || keys["w"])) {
        tank.moveForward(0.125);
    }
    else if ((keys["ArrowDown"] || keys["s"])) {
        tank.moveBackward(0.125);
    }
    if ((keys["ArrowLeft"] || keys["a"])) {
        tank.rotateCCW(1.25);
    }
    else if ((keys["ArrowRight"] || keys["d"])) {
        tank.rotateCW(1.25);
    }
    if (keys[" "] && tank.canShoot) {
    }
};
var checkMapCollision = function (obj, linVel, rotVel) {
    var toReturn = true;
    var corners = [[-0.5, -0.5 - linVel],
        [-0.5, 0.5 - linVel],
        [0.5, -0.5 - linVel],
        [0.5, 0.5 - linVel]];
    corners.forEach(function (corner) {
        var theta = (obj.dir + rotVel) * Math.PI / 180.0;
        var x = corner[0] * Math.cos(theta)
            - corner[1] * Math.sin(theta)
            + obj.x + 0.5;
        var y = corner[0] * Math.sin(theta)
            + corner[1] * Math.cos(theta)
            + obj.y + 0.5;
        var col = Math.floor(x);
        var row = Math.floor(y);
        if (map.tiles[row][col].isBlocking) {
            toReturn = false;
            return false;
        }
    });
    return toReturn;
};
var keyDownHandler = function (evt) {
    keys[evt.key] = true;
    return;
};
var keyUpHandler = function (evt) {
    keys[evt.key] = false;
    return;
};
var setFrameRate = function (frameRate) {
    clearInterval(interval);
    interval = setInterval(loop, Math.round(1000 / frameRate));
    return;
};
var render = function () {
    gameview.clear();
    gameview.center();
    gameview.applyTranslate(-(tank.xPos * 40 + 20), -(tank.yPos * 40 + 20));
    gameview.addLayer(background);
    /*
      bullets.map( ( bullet ) => {
        bullet.update();
        ctx.save();
        ctx.translate( ( bullet.x * 40 ), ( bullet.y * 40 ) );
        ctx.rotate( bullet.dir * Math.PI / 180.0 );
        bullet.render( ctx );
        ctx.restore();
      });*/
    gameview.popTransform();
    tank.updateImage();
    gameview.addLayer(tank.getLayer());
    gameview.popTransform();
};
