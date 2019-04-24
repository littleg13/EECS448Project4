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
    function Tank(xPos, yPos, dir, playerName, color, health) {
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
            _this.sprite.moveTreadsForward();
        };
        _this.moveBackward = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            var dirRads = (_this.dir / 180.0) * Math.PI;
            _this.xPos -= Math.sin(dirRads) * delta;
            _this.yPos += Math.cos(dirRads) * delta;
            _this.sprite.moveTreadsBackward();
        };
        _this.rotateCW = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            _this.dir += delta;
            _this.sprite.moveTreadsRight();
        };
        _this.rotateCCW = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            _this.dir -= delta;
            _this.sprite.moveTreadsLeft();
        };
        _this.addToSidebar = function (sidebar) {
            _this.layer.attachToParent(sidebar);
        };
        _this.xPos = xPos;
        _this.yPos = yPos;
        _this.dir = dir;
        _this.playerName = playerName;
        _this.sprite = new TankSprite(color);
        _this.layer = new Layer(playerName, 60, 60);
        _this.layer.getImage().classList.add("TankSprite");
        _this.health = health;
        _this.canShoot = false;
        return _this;
    }
    return Tank;
}(Entity));
