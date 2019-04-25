// Declared handlers, defined in main.
var handleKeyUp = function (evt) { };
var handleKeyDown = function (evt) { };
var sendServerUpdate = function () { };
var Game = /** @class */ (function () {
    function Game(mapDim) {
        var _this = this;
        /**
        *   INITIAL METHODS:
        *     Here are the methods that handle setting up various game components
        *
        */
        this.initLayers = function () {
            _this.gameview = new Layer("gameview", 800, 800);
            _this.background = new Layer("background", _this.mapDim * _this.tileDim, _this.mapDim * _this.tileDim);
            _this.gameview.attachToParent(document.getElementById("center"));
            _this.background.attachToParent(document.getElementById("hidden"));
        };
        this.startGame = function () {
            _this.gameTickUpdateInt = setInterval(function () { _this.gameTick(); }, Math.floor(1000 / 32));
            _this.sendServerUpdateInt = setInterval(function () { sendServerUpdate(); }, 40);
        };
        this.addTank = function (userID, username, xPos, yPos, direction, distanceLeft, color, health) {
            _this.tanks.push(new Tank(xPos, yPos, direction, username, userID, color, health));
        };
        this.populateSidebar = function () {
            var userInfoDiv = document.getElementById("userInfo");
            var lobbyInfoDiv = document.getElementById("lobbyInfo");
            _this.tanks.map(function (tank) {
                var userID = tank.userID;
                if (document.getElementById("info" + userID) === null) {
                    if (userID == localStorage.userID) {
                        tank.addToSidebar(userInfoDiv);
                    }
                    else {
                        tank.addToSidebar(lobbyInfoDiv);
                    }
                }
            });
            return;
        };
        /**
        *   PROCESS INPUT:
        *     Here are the methods that handle input processing
        *
        */
        this.checkMapCollision = function (obj, linVel, rotVel) {
            return true;
            /*    let toReturn = true;
                let map = this.map;
                let corners =
                  [ [ -0.5, -0.5 - linVel ],
                    [ -0.5,  0.5 - linVel ],
                    [  0.5, -0.5 - linVel ],
                    [  0.5,  0.5 - linVel ] ];
                corners.forEach( ( corner ) => {
                  let theta = ( obj.dir + rotVel ) * Math.PI / 180.0;
                  let x = corner[0] * Math.cos( theta )
                        - corner[1] * Math.sin( theta )
                        + obj.x + 0.5;
                  let y = corner[0] * Math.sin( theta )
                        + corner[1] * Math.cos( theta )
                        + obj.y + 0.5;
                  let col = Math.floor( x );
                  let row = Math.floor( y );
                  if( map.tiles[ row ][ col ].isBlocking ) {
                    toReturn = false;
                    return false;
                  }
                });
                return toReturn;*/
        };
        this.processInput = function () {
            var player = _this.getPlayer();
            if (_this.curTurn != localStorage.userID)
                return;
            if (_this.keys["ArrowLeft"] || _this.keys["a"]) {
                if (_this.checkMapCollision(player, 0, -1.0)) {
                    player.rotateCCW();
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys["ArrowRight"] || _this.keys["d"]) {
                if (_this.checkMapCollision(player, 0, 1.0)) {
                    player.rotateCW();
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys[" "]) {
                if (player.canShoot && !_this.getPlayerShot()) {
                    _this.setPlayerShot(true);
                }
                _this.keys[" "] = false;
            }
            if (player.distanceLeft <= 0)
                return;
            var deltaPos = Math.min(player.distanceLeft, 0.125);
            if (_this.keys["ArrowUp"] || _this.keys["w"]) {
                if (_this.checkMapCollision(player, 0.125, 0)) {
                    player.moveForward(0.125);
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys["ArrowDown"] || _this.keys["s"]) {
                if (_this.checkMapCollision(player, -0.125, 0)) {
                    player.moveBackward(0.125);
                    _this.setPlayerMoved();
                }
            }
            player.distanceLeft = Math.max(0, player.distanceLeft);
        };
        this.recordKeyPress = function (key) {
            if (!_this.keys[" "]) {
                _this.keyTimes[key] = new Date();
                _this.keys[" "] = true;
            }
        };
        /**
        *   UPDATE METHODS:
        *     Here are the methods that handle various game state updates
        *
        */
        this.updateMap = function (map) {
            _this.map.update(map);
            _this.background.drawItem(_this.map);
        };
        this.updateTankHealth = function (userID, health) {
            _this.getPlayer(userID).setHealth(health);
        };
        this.updateTankPosition = function (userID, newXPos, newYPos, newDirection) {
            console.log({ xPos: newXPos, yPos: newYPos, dir: newDirection });
            var tank = _this.getPlayer(userID);
            var deltaDir = newDirection - tank.dir;
            if (deltaDir < 0) {
                tank.rotateCCW(deltaDir);
            }
            else if (deltaDir > 0) {
                tank.rotateCW(deltaDir);
            }
            var deltaXPos = tank.xPos - newXPos;
            var deltaYPos = tank.yPos - newYPos;
            var dirRads = newDirection * Math.PI / 180.0;
            var deltaLocalY = deltaXPos * Math.sin(dirRads) + deltaYPos * Math.cos(dirRads);
            if (deltaLocalY > 0) {
                tank.moveForward(deltaLocalY);
            }
            else if (deltaLocalY < 0) {
                tank.moveBackward(deltaLocalY);
            }
        };
        this.updateTurn = function (userID) {
            var player = _this.getPlayer(userID);
            player.canShoot = true;
            player.distanceLeft = 5.0;
            _this.curTurn = userID;
        };
        this.fire = function (shooterID, power, curve, dist) {
            var shooter = _this.getPlayer(shooterID);
            if (shooter.canShoot) {
                var bullet = new Bullet(shooter.xPos + 0.5, shooter.yPos + 0.5, shooter.dir, dist, power, curve);
                _this.bullets.push(bullet);
                shooter.canShoot = false;
            }
        };
        this.endGame = function (winnerUserID) {
            _this.won = true;
            alert("Game over. Winner is: " + _this.getPlayer(winnerUserID).playerName);
            delete localStorage.userID;
            delete localStorage.lobbyCode;
        };
        this.showMsg = function (username, text) {
            var messageWindow = document.getElementById("messageWindow");
            var msg = document.createElement("div");
            msg.classList.add("message");
            var sender = document.createElement("div");
            sender.classList.add("sender");
            sender.innerHTML = username + ": ";
            msg.appendChild(sender);
            var content = document.createElement("div");
            content.classList.add("content");
            content.innerHTML = text;
            msg.appendChild(content);
            messageWindow.insertAdjacentElement("beforeend", msg);
        };
        /**
        *   RENDERING METHODS:
        *     Here are the methods that handle various rendering functions.
        *
        */
        this.renderMap = function () {
            _this.gameview.addLayer(_this.background);
        };
        this.renderTanks = function () {
            _this.tanks.map(function (tank) {
                if (tank.health <= 0) {
                    return;
                }
                _this.renderTank(tank);
            });
        };
        this.renderTank = function (tank) {
            tank.updateImage();
            _this.gameview.applyTranslate(_this.tileDim * tank.xPos, _this.tileDim * tank.yPos);
            if (tank.userID == _this.curTurn) {
                _this.gameview.drawItem(new Circle(20, 20, tank.distanceLeft * _this.tileDim, "#eeff007f", "#000000ff"));
            }
            _this.gameview.addLayer(tank.getLayer(), -10, -10); // Account for the padding on the sprite's canvas
            _this.gameview.popTransform();
        };
        /**
        * To-do:
        *   [ ] - Collision Check
        *   [ ] - One collision, trigger animation
        *   [ ] - Create animation
        */
        this.renderBullets = function () {
            _this.bullets = _this.bullets.filter(function (bullet) {
                _this.gameview.applyTranslate(bullet.xPos * _this.tileDim, bullet.yPos * _this.tileDim);
                _this.gameview.applyRotation(bullet.dir);
                _this.gameview.drawItem(bullet.sprite);
                _this.gameview.popTransform();
                _this.gameview.popTransform();
                // update bullet position
                bullet.update();
                return (!bullet.boom);
            });
        };
        this.renderLoop = function () {
            _this.gameview.applyScale(_this.scale, _this.scale);
            _this.renderMap();
            _this.renderBullets();
            _this.renderTanks();
            _this.gameview.popTransform();
        };
        this.gameTick = function () {
            _this.renderLoop();
            _this.processInput();
        };
        /**
        *     GET AND SET METHODS:
        *       Here are the methods that handle setting and getting game state variables.
        *
        */
        this.getPlayerMoved = function () { return _this.movedSinceLastTransmit; };
        this.setPlayerMoved = function (val) {
            if (val === void 0) { val = true; }
            _this.movedSinceLastTransmit = val;
        };
        this.getPlayerShot = function () { return _this.playerShot; };
        this.setPlayerShot = function (val) {
            if (val === void 0) { val = false; }
            _this.playerShot = val;
        };
        this.getPlayer = function (id) {
            if (id === void 0) { id = null; }
            if (id === null) {
                id = localStorage.userID;
            }
            var filteredSet = _this.tanks.filter(function (tank) { return tank.userID = id; });
            if (filteredSet == [])
                return null;
            else
                return filteredSet[0];
        };
        this.getPlayerPos = function () {
            var player = _this.getPlayer();
            return [player.xPos, player.yPos];
        };
        this.getPlayerDir = function () {
            return _this.getPlayer().dir;
        };
        this.map = new Map();
        this.mapDim = mapDim;
        this.scale = 1;
        this.tanks = [];
        this.curTurn = "";
        this.distLeftThisTurn = 5.0;
        this.curBoxDim = 40;
        this.tileDim = 40;
        this.bullets = [];
        this.keys = [];
        this.keyTimes = {};
        this.movedSinceLastTransmit = false;
        this.playerShot = false;
        this.begun = false;
        this.won = false;
        this.initLayers();
    }
    return Game;
}());
