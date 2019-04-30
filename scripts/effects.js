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
var Effect = /** @class */ (function () {
    function Effect(xPos, yPos, dir) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.dir = dir;
    }
    return Effect;
}());
var ExplosionEffect = /** @class */ (function (_super) {
    __extends(ExplosionEffect, _super);
    function ExplosionEffect(xPos, yPos, dir) {
        var _this = _super.call(this, xPos, yPos, dir) || this;
        _this.update = function () {
            _this.done = _this.sprite.update();
            return _this.done;
        };
        _this.render = function (ctx) {
            ctx.save();
            ctx.rotate(_this.dir * Math.PI / 180.0 + Math.PI / 2);
            _this.sprite.render(ctx);
            ctx.restore();
        };
        _this.sprite = new ExplosionSprite();
        _this.done = false;
        return _this;
    }
    return ExplosionEffect;
}(Effect));
