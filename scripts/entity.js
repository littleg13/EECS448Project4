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
        this.getHitbox = function () {
            return _this.hitbox;
        };
    }
    return Entity;
}());
var Hitbox = /** @class */ (function () {
    function Hitbox(w, h) {
        this.w = w;
        this.h = h;
    }
    return Hitbox;
}());
var Tank = /** @class */ (function (_super) {
    __extends(Tank, _super);
    function Tank(xPos, yPos, dir, playerName, userID, color, health) {
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
        _this.addPowerups = function (powerups) {
            powerups.forEach(_this.addPowerup);
        };
        _this.addPowerup = function (powerup) { };
        _this.xPos = xPos;
        _this.yPos = yPos;
        _this.dir = dir;
        _this.distanceLeft = 5.0;
        _this.color = color;
        _this.playerName = playerName;
        _this.userID = userID;
        _this.sprite = new TankSprite(color);
        _this.nameTag = new NameTag(playerName, health);
        _this.layer = new Layer(playerName, 60, 60);
        _this.hitbox = new Hitbox(35, 40);
        _this.health = health;
        _this.canShoot = false;
        return _this;
    }
    return Tank;
}(Entity));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(xPos, yPos, dir, distToGo, power, curve) {
        var _this = _super.call(this) || this;
        _this.render = function () {
            _this.layer.applyTranslate(_this.xPos * 40, _this.yPos * 40);
            _this.layer.applyRotation(_this.dir);
            _this.layer.drawItem(_this.sprite);
            //    this.layer.drawItem( this.hitbox );
            _this.layer.popTransform();
            _this.layer.popTransform();
        };
        _this.detonate = function () {
            _this.boom = true;
        };
        _this.update = function () {
            var dirRad = _this.dir * Math.PI / 180.0;
            _this.xPos += Math.sin(dirRad) * 0.5;
            _this.yPos -= Math.cos(dirRad) * 0.5;
            _this.distGone += 0.5;
            _this.dir += Math.max(0, _this.distGone - _this.power) * _this.curve;
            if (_this.distToGo <= _this.distGone) {
                _this.detonate();
            }
        };
        _this.xPos = xPos;
        _this.yPos = yPos;
        _this.dir = dir;
        _this.hitbox = new Rect(-5, -15, 10, 25, "green");
        _this.sprite = new BulletSprite();
        _this.distToGo = distToGo;
        _this.distGone = 0.0;
        _this.power = power;
        _this.curve = curve;
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
        console.log(_this.xPos);
        _this.sprite = new Rect(0, 0, 40, 40);
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
var Buff = /** @class */ (function () {
    function Buff() {
    }
    return Buff;
}());
