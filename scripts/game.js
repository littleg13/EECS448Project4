// Declared handlers, defined in main.
var sendServerUpdate = function () { };
var PowerupUpdate = /** @class */ (function () {
    function PowerupUpdate() {
    }
    return PowerupUpdate;
}());
var Game = /** @class */ (function () {
    function Game(mapDim) {
        var _this = this;
        /**
        *   INITIAL METHODS:
        *     Here are the methods that handle setting up various game components
        *
        */
        this.initLayers = function () {
            var viewRadius = 7; // in tiles
            _this.gameview = new Layer("gameview", 2 * viewRadius * _this.tileDim, 2 * viewRadius * _this.tileDim);
            _this.gameview.attachToParent(document.getElementById("center"));
            _this.effects = new Layer("effects", _this.mapDim * _this.tileDim, _this.mapDim * _this.tileDim);
            _this.effects.attachToParent(document.getElementById("hidden"));
            _this.background = new Layer("background", _this.mapDim * _this.tileDim, _this.mapDim * _this.tileDim);
            _this.background.attachToParent(document.getElementById("hidden"));
            _this.minimap = new Layer("minimap", _this.miniDim * _this.mapDim, _this.miniDim * _this.mapDim);
            _this.minimap.attachToParent(document.getElementById("mini"));
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
            var userInfoDiv = document.getElementById("userCard");
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
            var tiles = _this.map.tiles;
            return obj.projHitbox(linVel, rotVel).some(function (corner) {
                var col = Math.floor(corner.x);
                var row = Math.floor(corner.y);
                var retVal = tiles[row][col].isBlocking;
                if (obj instanceof Bullet) {
                    _this.map.redraw(row, col);
                    _this.background.applyTranslate(col * _this.tileDim, row * _this.tileDim);
                    _this.background.drawItem(_this.map.getTile(row, col));
                    _this.background.popTransform();
                }
                return retVal;
            });
        };
        this.checkPowerupCollision = function (obj) {
            var corners = obj.projHitbox();
            var powerupIndices = _this.powerups.map(function (powerup, index) {
                var match = corners.some(function (point) {
                    var _a = [point.x, point.y].map(Math.floor), col = _a[0], row = _a[1];
                    var _b = [powerup.xPos, powerup.yPos].map(Math.floor), pCol = _b[0], pRow = _b[1];
                    return (pCol == col && pRow == row);
                });
                return (match ? index : -1);
            }).filter(function (index) {
                return index > -1;
            });
            return powerupIndices;
        };
        this.processInput = function () {
            var player = _this.getPlayer();
            if (_this.curTurn != localStorage.userID)
                return;
            if (_this.keys["ArrowLeft"]) {
                if (!_this.checkMapCollision(player, 0, -2.0)) {
                    player.rotateCCW(2.0);
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys["ArrowRight"]) {
                if (!_this.checkMapCollision(player, 0, 2.0)) {
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
            if (_this.keys["ArrowUp"]) {
                if (!_this.checkMapCollision(player, 0.125, 0)) {
                    player.moveForward(0.125);
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys["ArrowDown"]) {
                if (!_this.checkMapCollision(player, -0.125, 0)) {
                    player.moveBackward(0.125);
                    _this.setPlayerMoved();
                }
            }
            if (_this.getPlayerMoved()) {
                _this.checkPowerupCollision(player).forEach(function (powerupIndex) {
                    player.addPowerup(_this.powerups.splice(powerupIndex, 1));
                });
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
            if (_this.map.set) {
                _this.map.update(map);
            }
            else {
                _this.map.setTiles(map);
                _this.background.drawItem(_this.map);
            }
        };
        this.updateTankHealth = function (userID, health) {
            _this.getPlayer(userID).setHealth(health);
        };
        this.updateTankPowerups = function (userID, powerups) {
            /*
            let objs = powerups.map( ( str : string ) : Buff => {
              return new Buff();
            } );
            this.getPlayer( userID ).addPowerups( objs );*/
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
            _this.checkPowerupCollision(tank).forEach(function (powerupIndex) {
                tank.addPowerup(_this.powerups.splice(powerupIndex, 1));
            });
        };
        this.updateTurn = function (userID) {
            var prevPlayer = _this.getPlayer(_this.curTurn);
            if (prevPlayer != undefined) {
                prevPlayer.setTurn(false);
            }
            _this.getPlayer(userID).setTurn(true);
            _this.curTurn = userID;
        };
        this.updatePowerups = function (updates) {
            _this.powerups = updates.map(function (powerupData) {
                switch (powerupData.type) {
                    case "multiShot":
                        return new MultiShotToken(powerupData.col, powerupData.row);
                        break;
                    case "buildWall":
                        return new BuildWallToken(powerupData.col, powerupData.row);
                        break;
                    case "increaseMoveDist":
                        return new IncreaseMoveDistToken(powerupData.col, powerupData.row);
                        break;
                    case "healthPack":
                        return new HealthPackToken(powerupData.col, powerupData.row);
                        break;
                    default:
                        break;
                }
            });
            _this.powerups.forEach(function (powerup) {
                powerup.attachToLayer(_this.effects);
            });
        };
        this.fire = function (shooterID, power, curve, dist) {
            var shooter = _this.getPlayer(shooterID);
            if (shooter.canShoot) {
                var bullet = new Bullet(shooter.xPos, shooter.yPos, shooter.dir, dist, power, curve);
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
        this.renderMinimap = function () {
            _this.minimap.applyScale(_this.miniDim / _this.tileDim, _this.miniDim / _this.tileDim);
            _this.minimap.addLayer(_this.background);
            _this.minimap.popTransform();
        };
        this.renderTanks = function () {
            _this.tanks.forEach(function (tank) {
                if (tank.health <= 0) {
                    return;
                }
                _this.renderTank(tank);
            });
        };
        this.renderTank = function (tank) {
            tank.updateImage();
            _this.gameview.applyTranslate(_this.tileDim * tank.xPos, _this.tileDim * tank.yPos);
            _this.gameview.addLayer(tank.getLayer(), -10, -10);
            _this.gameview.applyTranslate(_this.tileDim / 2, _this.tileDim);
            _this.gameview.drawItem(tank.nameTag);
            _this.gameview.popTransform();
            _this.gameview.popTransform();
            // To-do: add nametag w/ health bar
            var _a = [tank.xPos, tank.yPos].map(function (val) {
                return _this.miniDim * (val + 0.5);
            }), xOffset = _a[0], yOffset = _a[1];
            _this.minimap.applyTranslate(xOffset, yOffset);
            _this.minimap.drawItem(new Circle(0, 0, _this.miniDim / 2, tank.color));
            _this.minimap.popTransform();
        };
        this.renderPowerups = function () {
            _this.powerups.forEach(function (powerup) {
                powerup.render();
            });
        };
        this.renderEffects = function () {
            _this.effects.clear();
            if (_this.curTurn == localStorage.userID) {
                var tank = _this.getPlayer();
                _this.effects.applyTranslate((tank.xPos + 0.5) * _this.tileDim, (tank.yPos + 0.5) * _this.tileDim);
                _this.effects.drawItem(new Circle(0, 0, tank.distanceLeft * _this.tileDim, "rgba( 238, 255, 0, 0.5 )", "#000000"));
                _this.effects.popTransform();
            }
            _this.renderBullets();
            _this.renderPowerups();
            _this.gameview.addLayer(_this.effects);
        };
        this.renderBullets = function () {
            _this.bullets = _this.bullets.filter(function (bullet) {
                bullet.render();
                if (!_this.checkMapCollision(bullet, bullet.speed, 0.0)) {
                    bullet.update();
                    return true;
                }
                else {
                    return false;
                }
            });
        };
        this.renderLoop = function () {
            var _a = _this.getPlayerPos().map(function (val) {
                return -(val + 0.5) * _this.tileDim;
            }), xOffset = _a[0], yOffset = _a[1];
            _this.gameview.clear();
            _this.gameview.applyScale(_this.scale, _this.scale);
            _this.gameview.applyTranslate(xOffset, yOffset);
            _this.gameview.center();
            _this.renderMap();
            _this.renderEffects();
            _this.renderMinimap();
            _this.renderTanks();
            _this.gameview.popTransform();
            _this.gameview.popTransform();
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
        this.map = new Map(mapDim);
        this.mapDim = mapDim;
        this.scale = 1;
        this.tanks = [];
        this.curTurn = "";
        this.distLeftThisTurn = 5.0;
        this.curBoxDim = 40;
        this.tileDim = 40;
        this.miniDim = 10;
        this.bullets = [];
        this.powerups = [];
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
