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
            var viewRadius = 10; // in tiles
            _this.gameview = new Layer("gameview", 2 * viewRadius * _this.tileDim, 2 * viewRadius * _this.tileDim);
            _this.gameview.attachToParent(document.getElementById("gameBody"));
            var canvasDim = _this.mapDim * _this.tileDim;
            _this.entities = new Layer("entities", canvasDim, canvasDim);
            _this.entities.attachToParent(document.getElementById("hidden"));
            _this.effects = new Layer("effects", canvasDim, canvasDim);
            _this.effects.attachToParent(document.getElementById("hidden"));
            _this.background = new Layer("background", canvasDim, canvasDim);
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
                    //        this.effects.push( new ExplosionSprite() );
                    _this.background.applyTranslate(col * _this.tileDim, row * _this.tileDim);
                    _this.background.drawItem(_this.map.getTile(row, col));
                    _this.background.popTransform();
                }
                return retVal;
            });
        };
        this.checkPowerupCollision = function (obj) {
            var _a = [obj.xPos + 0.5, obj.yPos + 0.5].map(Math.floor), col = _a[0], row = _a[1];
            var retIndex = _this.powerups.map(function (powerup) {
                if (powerup.xPos == col && powerup.yPos == row)
                    return true;
                else
                    return false;
            }).indexOf(true);
            return retIndex;
        };
        this.checkBulletCollision = function (bullet) {
            for (var speed = 0.1; speed < bullet.speed; speed += 0.1) {
                var _a = [bullet.xPos + 0.5, bullet.yPos + 0.5], bullX = _a[0], bullY = _a[1];
                bullX += speed * Math.sin(bullet.dir * Math.PI / 180.0);
                bullY -= speed * Math.cos(bullet.dir * Math.PI / 180.0);
                if (_this.checkBulletTrajectory(bullX, bullY, bullet.shooterID))
                    return true;
            }
            return false;
        };
        this.checkBulletTrajectory = function (bullX, bullY, userID) {
            var _a = [bullX, bullY].map(Math.floor), bullCol = _a[0], bullRow = _a[1];
            var tile = _this.map.getTile(bullRow, bullCol);
            if (tile.isBlocking) {
                _this.map.redraw(bullRow, bullCol);
                _this.background.applyTranslate(bullCol * _this.tileDim, bullRow * _this.tileDim);
                _this.background.drawItem(_this.map.getTile(bullRow, bullCol));
                _this.background.popTransform();
                return true;
            }
            else {
                var retVal = _this.tanks.some(function (tank) {
                    if (tank.userID == userID)
                        return false;
                    var dirRad = tank.dir * Math.PI / 180.0;
                    var _a = [tank.xPos + 0.5, tank.yPos + 0.5], xPos = _a[0], yPos = _a[1];
                    var between = function (val, a, b) {
                        var low = Math.min(a, b);
                        var high = Math.max(a, b);
                        return (low < val && val < high);
                    };
                    var _b = [bullX - xPos, bullY - yPos], delX = _b[0], delY = _b[1];
                    var dist = Math.sqrt(delX * delX + delY * delY);
                    return dist < 0.5;
                });
                return retVal;
            }
        };
        this.processInput = function () {
            var player = _this.getPlayer();
            if (_this.curTurn != localStorage.userID)
                return;
            if (_this.keys["ArrowLeft"]) {
                if (!_this.checkMapCollision(player, 0, -4.0)) {
                    player.rotateCCW(4.0);
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys["ArrowRight"]) {
                if (!_this.checkMapCollision(player, 0, 4.0)) {
                    player.rotateCW(4.0);
                    _this.setPlayerMoved();
                }
            }
            if (_this.keys[" "]) {
                if (player.canShoot && !_this.getPlayerShot()) {
                    _this.setPlayerShot(true);
                }
                _this.keys[" "] = false;
            }
            if (_this.keys["e"] && player.buildWall != 0) {
                var _a = [player.xPos, player.yPos], xPos = _a[0], yPos = _a[1];
                xPos += 1.5 * Math.sin(player.dir * Math.PI / 180.0);
                yPos -= 1.5 * Math.cos(player.dir * Math.PI / 180.0);
                var _b = [xPos + 0.5, yPos + 0.5].map(Math.floor), col = _b[0], row = _b[1];
                _this.setBuildWall(row, col);
                player.buildWall--;
                _this.keys["e"] = false;
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
                var powerupIndex = _this.checkPowerupCollision(player);
                if (powerupIndex > -1) {
                    var powerup = _this.powerups.splice(powerupIndex, 1)[0];
                    player.addPowerup(powerup);
                }
            }
            player.distanceLeft = Math.max(0, player.distanceLeft);
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
            console.log(powerups);
        };
        this.updateTankDistanceLeft = function (userID, distanceLeft) {
            _this.getPlayer(userID).distanceLeft = distanceLeft;
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
            /*
            this.checkPowerupCollision( tank ).forEach( ( powerupIndex : number ) : void => {
              tank.addPowerups( this.powerups.splice( powerupIndex, 1 ) );
            } );
            */
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
                powerup.attachToLayer(_this.entities);
            });
        };
        this.placeWall = function (row, col) {
            _this.map.setTile(1, row, col);
            _this.map.redraw(row, col);
            _this.background.drawItem(_this.map);
        };
        this.fire = function (shooterID, power, curve, dist, dirOffset) {
            var shooter = _this.getPlayer(shooterID);
            if (shooter.canShoot) {
                var bullet = new Bullet(shooter.userID, shooter.xPos, shooter.yPos, shooter.dir + dirOffset, dist, power, curve);
                bullet.attachToLayer(_this.entities);
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
            var updateScroll = (messageWindow.scrollHeight - messageWindow.offsetHeight) == messageWindow.scrollTop;
            messageWindow.insertAdjacentElement("beforeend", msg);
            if (updateScroll)
                msg.scrollIntoView(false);
        };
        /**
        *   RENDERING METHODS:
        *     Here are the methods that handle various rendering functions.
        *
        */
        this.renderMap = function () {
            _this.gameview.addLayer(_this.background);
        };
        this.redrawTile = function (row, col) {
            _this.map.redraw(row, col);
            _this.background.drawItem(_this.map);
        };
        this.renderMinimap = function () {
            _this.minimap.applyScale(_this.miniDim / _this.tileDim, _this.miniDim / _this.tileDim);
            _this.minimap.addLayer(_this.background);
            _this.minimap.popTransform();
        };
        this.renderEntities = function () {
            _this.entities.clear();
            _this.renderBullets();
            _this.renderPowerups();
            _this.renderTanks();
            _this.gameview.addLayer(_this.entities);
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
            if (tank.buildWall != 0) {
                var dirRad = tank.dir * Math.PI / 180.0;
                var _a = [tank.xPos, tank.yPos], xPos = _a[0], yPos = _a[1];
                xPos += 1.5 * Math.sin(dirRad);
                yPos -= 1.5 * Math.cos(dirRad);
                var _b = [xPos + 0.5, yPos + 0.5].map(Math.floor), col = _b[0], row = _b[1];
                _this.entities.applyTranslate(_this.tileDim * col, _this.tileDim * row);
                _this.entities.drawItem(new ShadowBlock());
                _this.entities.popTransform();
            }
            _this.entities.applyTranslate(_this.tileDim * tank.xPos, _this.tileDim * tank.yPos);
            _this.entities.addLayer(tank.getLayer(), -10, -10);
            _this.entities.applyTranslate(_this.tileDim / 2, _this.tileDim);
            _this.entities.drawItem(tank.nameTag);
            _this.entities.popTransform();
            _this.entities.popTransform();
            // To-do: add nametag w/ health bar
            var _c = [tank.xPos, tank.yPos].map(function (val) {
                return _this.miniDim * (val + 0.5);
            }), xOffset = _c[0], yOffset = _c[1];
            _this.minimap.applyTranslate(xOffset, yOffset);
            _this.minimap.drawItem(new Circle(0, 0, _this.miniDim / 2, tank.color));
            _this.minimap.popTransform();
        };
        this.renderPowerups = function () {
            _this.powerups.forEach(function (powerup) {
                powerup.render();
            });
        };
        this.renderBullets = function () {
            _this.bullets = _this.bullets.filter(function (bullet) {
                bullet.render();
                var delDir = Math.abs(_this.getPlayer(bullet.shooterID).dir - bullet.dir);
                if (!_this.checkBulletCollision(bullet) && delDir < 270) {
                    bullet.update();
                    return true;
                }
                else {
                    _this.explosions.push(new ExplosionEffect(bullet.xPos, bullet.yPos, bullet.dir));
                    return false;
                }
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
            _this.explosions = _this.explosions.filter(function (explosion) {
                var _a = [explosion.xPos + 0.5, explosion.yPos + 0.5], xPos = _a[0], yPos = _a[1];
                _this.effects.applyTranslate(xPos * _this.tileDim, yPos * _this.tileDim);
                _this.effects.drawItem(explosion);
                _this.effects.popTransform();
                explosion.update();
                return !explosion.done;
            });
            _this.gameview.addLayer(_this.effects);
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
            _this.renderMinimap();
            _this.renderEffects();
            _this.renderEntities();
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
        this.getPlayerPowerups = function () { };
        this.getBuildWall = function () {
            return _this.buildWall;
        };
        this.setBuildWall = function (row, col) {
            if (row === undefined && col === undefined) {
                _this.buildWall = null;
            }
            else {
                _this.buildWall = { row: row, col: col };
            }
        };
        this.map = new Map(mapDim);
        this.mapDim = mapDim;
        this.scale = 1;
        // Entity lists
        this.tanks = [];
        this.bullets = [];
        this.powerups = [];
        this.explosions = [];
        this.curTurn = "";
        this.distLeftThisTurn = 5.0;
        this.curBoxDim = 40;
        this.tileDim = 40;
        this.miniDim = 10;
        this.keys = [];
        this.keyTimes = {};
        this.movedSinceLastTransmit = false;
        this.playerShot = false;
        this.buildWall = null;
        this.begun = false;
        this.won = false;
        this.initLayers();
    }
    return Game;
}());
