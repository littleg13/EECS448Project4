var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Entity = /** @class */ (function () {
    function Entity() {
        var _this = this;
        this.attachToLayer = function (layer) {
            _this.layer = layer;
        };
        this.projHitbox = function (linVel, rotVel) {
            if (linVel === void 0) { linVel = 0; }
            if (rotVel === void 0) { rotVel = 0; }
            var dirRad = (_this.dir + rotVel) * Math.PI / 180.0;
            var dX = linVel * Math.sin(dirRad) + _this.xPos + 0.5;
            var dY = -linVel * Math.cos(dirRad) + _this.yPos + 0.5;
            var localHitbox = _this.sprite.hitbox;
            var delX = localHitbox.w / _this.width;
            var offX = localHitbox.xOffset / _this.width;
            var delY = localHitbox.h / _this.height;
            var offY = localHitbox.yOffset / _this.height;
            var corners = [
                new Point(offX, offY),
                new Point(offX + delX, offY),
                new Point(offX + delX, offY + delY),
                new Point(offX, offY + delY)
            ];
            return corners.map(function (point) {
                var x = point.x * Math.cos(dirRad) - point.y * Math.sin(dirRad);
                var y = point.x * Math.sin(dirRad) + point.y * Math.cos(dirRad);
                return new Point(x + dX, y + dY);
            });
        };
    }
    return Entity;
}());
var Hitbox = /** @class */ (function () {
    function Hitbox(xOffset, yOffset, w, h) {
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.w = w;
        this.h = h;
    }
    return Hitbox;
}());
var Tank = /** @class */ (function (_super) {
    __extends(Tank, _super);
    function Tank(xPos, yPos, dir, playerName, userID, color, health) {
        var _a;
        var _this = _super.call(this) || this;
        _this.updateImage = function () {
            _this.layer.clear();
            _this.layer.center();
            _this.layer.applyRotation(_this.dir);
            _this.layer.drawItem(_this.sprite);
            _this.layer.popTransform();
            _this.layer.popTransform();
        };
        _this.getLayer = function () {
            return _this.layer;
        };
        _this.setColor = function (color) {
            _this.sprite.changeColor(color);
            return _this;
        };
        _this.moveForward = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            var dirRads = (_this.dir / 180.0) * Math.PI;
            _this.xPos += Math.sin(dirRads) * delta;
            _this.yPos -= Math.cos(dirRads) * delta;
            _this.distanceLeft = Math.max(_this.distanceLeft - delta, 0);
            _this.sprite.moveTreadsForward();
        };
        _this.moveBackward = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            var dirRads = (_this.dir / 180.0) * Math.PI;
            _this.xPos -= Math.sin(dirRads) * delta;
            _this.yPos += Math.cos(dirRads) * delta;
            _this.distanceLeft = Math.max(_this.distanceLeft - delta, 0);
            _this.sprite.moveTreadsBackward();
        };
        _this.rotateCW = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            _this.dir = (_this.dir + delta) % 360.0;
            _this.sprite.moveTreadsRight();
        };
        _this.rotateCCW = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            _this.dir = (_this.dir - delta + 360.0) % 360.0;
            _this.sprite.moveTreadsLeft();
        };
        _this.addToSidebar = function (sidebar) {
            _this.infoCard = new PlayerCard(_this.userID, _this.playerName, _this.health, _this.layer);
            _this.infoCard.buildCard();
            _this.infoCard.setParent(sidebar);
        };
        _this.setHealth = function (health) {
            _this.health = health;
            if (health == 0) {
                _this.alive = false;
            }
            _this.infoCard.updateHealth(health);
            _this.nameTag.updateHealth(health);
        };
        _this.setTurn = function (isTurn) {
            if (isTurn === void 0) { isTurn = false; }
            _this.canShoot = true;
            _this.distanceLeft = 5.0;
            _this.infoCard.setTurn(isTurn);
        };
        _this.addPowerup = function (powerup) {
            if (powerup instanceof MultiShotToken)
                _this.multiShot++;
            else if (powerup instanceof BuildWallToken)
                _this.buildWall++;
            _this.sprite.setBuffs(_this.multiShot, _this.buildWall);
        };
        _this.clearPowerups = function () {
            _this.multiShot = 0;
            _this.buildWall = 0;
        };
        _this.xPos = xPos;
        _this.yPos = yPos;
        _this.dir = dir;
        _this.distanceLeft = 5.0;
        _this.color = color;
        _this.playerName = playerName;
        _this.userID = userID;
        _this.sprite = new TankSprite(color);
        _a = _this.sprite.getDim(), _this.width = _a[0], _this.height = _a[1];
        _this.nameTag = new NameTag(playerName, health);
        _this.layer = new Layer(playerName, 60, 60);
        _this.health = health;
        _this.canShoot = false;
        _this.multiShot = 0;
        _this.buildWall = 0;
        return _this;
    }
    return Tank;
}(Entity));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(userID, xPos, yPos, dir, distToGo, power, curve) {
        var _a;
        var _this = _super.call(this) || this;
        _this.render = function () {
            _this.layer.applyTranslate((_this.xPos + 0.5) * _this.width, (_this.yPos + 0.5) * _this.height);
            _this.layer.applyRotation(_this.dir);
            _this.layer.drawItem(_this.sprite);
            _this.layer.popTransform();
            _this.layer.popTransform();
        };
        _this.detonate = function () {
            _this.boom = true;
        };
        _this.update = function () {
            var dirRad = _this.dir * Math.PI / 180.0;
            _this.xPos += Math.sin(dirRad) * _this.speed;
            _this.yPos -= Math.cos(dirRad) * _this.speed;
            _this.distGone += _this.speed;
            _this.dir += Math.max(0, _this.distGone - _this.power) * _this.curve;
            return _this.boom;
        };
        _this.shooterID = userID;
        _this.xPos = xPos;
        _this.yPos = yPos;
        _this.dir = dir;
        _this.sprite = new BulletSprite();
        _a = _this.sprite.getDim(), _this.width = _a[0], _this.height = _a[1];
        _this.distToGo = distToGo;
        _this.distGone = 0.0;
        _this.power = power;
        _this.curve = curve;
        _this.speed = 0.5;
        return _this;
    }
    return Bullet;
}(Entity));
var Powerup = /** @class */ (function (_super) {
    __extends(Powerup, _super);
    function Powerup(x, y) {
        var _this = _super.call(this) || this;
        _this.render = function () {
            if (_this.layer === undefined)
                return;
            _this.layer.applyTranslate((_this.xPos + 0.5) * 40, (_this.yPos + 0.5) * 40);
            _this.layer.drawItem(_this.sprite);
            _this.layer.popTransform();
        };
        _this.xPos = x;
        _this.yPos = y;
        return _this;
    }
    return Powerup;
}(Entity));
var MultiShotToken = /** @class */ (function (_super) {
    __extends(MultiShotToken, _super);
    function MultiShotToken(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.sprite = new MultiShotSprite();
        return _this;
    }
    return MultiShotToken;
}(Powerup));
var BuildWallToken = /** @class */ (function (_super) {
    __extends(BuildWallToken, _super);
    function BuildWallToken(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.sprite = new BuildWallSprite();
        return _this;
    }
    return BuildWallToken;
}(Powerup));
var IncreaseMoveDistToken = /** @class */ (function (_super) {
    __extends(IncreaseMoveDistToken, _super);
    function IncreaseMoveDistToken(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.sprite = new IncreaseMoveDistSprite();
        return _this;
    }
    return IncreaseMoveDistToken;
}(Powerup));
var HealthPackToken = /** @class */ (function (_super) {
    __extends(HealthPackToken, _super);
    function HealthPackToken(x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.sprite = new HealthPackSprite();
        return _this;
    }
    return HealthPackToken;
}(Powerup));
