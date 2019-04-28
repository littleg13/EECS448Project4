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
            _this.effects = new Layer("effects", 800, 800);
            _this.background = new Layer("background", _this.mapDim * _this.tileDim, _this.mapDim * _this.tileDim);
            _this.gameview.attachToParent(document.getElementById("center"));
            _this.effects.attachToParent(document.getElementById("hidden"));
            _this.background.attachToParent(document.getElementById("hidden"));
        };
        this.startGame = function () {
            _this.gameTickUpdateInt = setInterval(function () { _this.gameTick(); }, Math.round(1000 / 32));
            _this.sendServerUpdateInt = setInterval(function () { sendServerUpdate(); }, 40);
            _this.populateSidebar();
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
            var toReturn = true;
            var map = _this.map;
            var halfWidth = 0.5;
            var halfHeight = 0.5;
            var corners = [[-halfWidth, -halfHeight - linVel],
                [-halfWidth, halfHeight - linVel],
                [halfWidth, -halfHeight - linVel],
                [halfWidth, halfHeight - linVel]];
            corners.forEach(function (corner) {
                var theta = (obj.dir + rotVel) * Math.PI / 180.0;
                var x = corner[0] * Math.cos(theta)
                    - corner[1] * Math.sin(theta)
                    + obj.xPos + 0.5;
                var y = corner[0] * Math.sin(theta)
                    + corner[1] * Math.cos(theta)
                    + obj.yPos + 0.5;
                var col = Math.floor(x);
                var row = Math.floor(y);
                if (map.tiles[row][col].isBlocking) {
                    toReturn = false;
                    return false;
                }
            });
            return toReturn;
        };
        this.processInput = function () {
            var player = _this.getPlayer();
            if (_this.curTurn != localStorage.userID)
                return;
            if (_this.keys["ArrowLeft"] || _this.keys["a"]) {
                if (_this.checkMapCollision(player, 0, -1.0)) {
                    player.rotateCCW(2.0);
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys["ArrowRight"] || _this.keys["d"]) {
                if (_this.checkMapCollision(player, 0, 1.0)) {
                    player.rotateCW(2.0);
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
            var tank = _this.getPlayer(userID);
            var deltaDir = ((newDirection * 180.0 / Math.PI) - tank.dir) % 360.0;
            if (deltaDir > 0) {
                tank.rotateCW(deltaDir);
            }
            else if (deltaDir < 0) {
                tank.rotateCCW(-deltaDir);
            }
            var deltaXPos = tank.xPos - newXPos;
            var deltaYPos = tank.yPos - newYPos;
            var dirRads = newDirection;
            var deltaLocalX = deltaXPos * Math.sin(-dirRads) - deltaYPos * Math.cos(-dirRads);
            var deltaLocalY = deltaXPos * Math.sin(-dirRads) + deltaYPos * Math.cos(-dirRads);
            if (deltaLocalY > 0) {
                tank.moveForward(deltaLocalY);
            }
            else if (deltaLocalY < 0) {
                tank.moveBackward(-deltaLocalY);
            }
        };
        this.updateTurn = function (userID) {
            var prevPlayer = _this.getPlayer(_this.curTurn);
            if (prevPlayer != undefined) {
                prevPlayer.setTurn(false);
            }
            _this.getPlayer(userID).setTurn(true);
            _this.curTurn = userID;
        };
        this.fire = function (shooterID, power, curve, dist) {
            var shooter = _this.getPlayer(shooterID);
            if (shooter.canShoot) {
                var bullet = new Bullet(shooter.xPos + 0.5, shooter.yPos + 0.5, shooter.dir, dist, power, curve);
                bullet.attachToLayer(_this.effects);
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
            if (username == _this.getPlayer().playerName) {
                msg.classList.add("self");
            }
            msg.classList.add("message");
            var sender = document.createElement("div");
            sender.classList.add("sender");
            sender.innerHTML = username;
            var content = document.createElement("div");
            content.classList.add("content");
            content.innerHTML = text;
            msg.appendChild(content);
            msg.appendChild(sender);
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
            _this.gameview.addLayer(tank.getLayer(), -10, -10); // Account for the padding on the sprite's canvas
            _this.gameview.applyTranslate(_this.tileDim / 2, _this.tileDim);
            _this.gameview.drawItem(tank.nameTag);
            _this.gameview.popTransform();
            // To-do: add nametag w/ health bar
            _this.gameview.popTransform();
        };
        this.renderEffects = function () {
            _this.effects.clear();
            if (_this.curTurn == localStorage.userID) {
                var tank_1 = _this.getPlayer();
                _this.effects.applyTranslate((tank_1.xPos + 0.5) * _this.tileDim, (tank_1.yPos + 0.5) * _this.tileDim);
                _this.effects.drawItem(new Circle(0, 0, tank_1.distanceLeft * _this.tileDim, "rgba( 238, 255, 0, 0.5 )", "#000000"));
                _this.effects.popTransform();
            }
            _this.renderBullets();
            _this.gameview.addLayer(_this.effects);
        };
        /**
        * To-do:
        *   [ ] - Collision Check
        *   [ ] - On collision, trigger animation
        *   [ ] - Create animation
        */
        this.renderBullets = function () {
            _this.bullets = _this.bullets.filter(function (bullet) {
                bullet.render();
                // update bullet position
                bullet.update();
                return (!bullet.boom);
            });
        };
        this.renderLoop = function () {
            _this.gameview.applyScale(_this.scale, _this.scale);
            _this.renderMap();
            _this.renderEffects();
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
            var filteredSet = _this.tanks.filter(function (tank) { return tank.userID == id; });
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
