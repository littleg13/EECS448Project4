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
    }
    return Entity;
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
            console.log(sidebar);
            var cardDiv = document.createElement("div");
            cardDiv.classList.add("playerCard");
            cardDiv.setAttribute("id", "info" + _this.userID);
            var usernameDiv = document.createElement("div");
            usernameDiv.classList.add("username");
            usernameDiv.innerHTML = _this.playerName;
            var healthDiv = document.createElement("div");
            healthDiv.classList.add("tankHealth");
            healthDiv.innerHTML = _this.health + "/100";
            var spriteDiv = document.createElement("div");
            spriteDiv.classList.add("tankSprite");
            cardDiv.appendChild(usernameDiv);
            cardDiv.appendChild(healthDiv);
            cardDiv.appendChild(spriteDiv);
            _this.layer.attachToParent(spriteDiv);
            sidebar.appendChild(cardDiv);
        };
        _this.setHealth = function (health) {
            _this.health = health;
            if (health == 0) {
                _this.alive = false;
            }
        };
        _this.xPos = xPos;
        _this.yPos = yPos;
        _this.dir = dir;
        _this.distanceLeft = 5.0;
        _this.playerName = playerName;
        _this.userID = userID;
        _this.sprite = new TankSprite(color);
        _this.layer = new Layer(playerName, 60, 60);
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
        _this.attachToLayer = function (layer) {
            _this.layer = layer;
        };
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
