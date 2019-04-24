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
var Tread = /** @class */ (function (_super) {
    __extends(Tread, _super);
    function Tread(x) {
        var _this = _super.call(this) || this;
        _this.shiftUp = function (delta) {
            if (delta === void 0) { delta = 0; }
            _this.counter.inc(delta);
        };
        _this.shiftDown = function (delta) {
            if (delta === void 0) { delta = 0; }
            _this.counter.dec(delta);
        };
        _this.render = function (ctx) {
            _this.mainRect.render(ctx);
            _this.rects.map(function (rect) { rect.render(ctx); });
        };
        _this.x = x;
        _this.mainRect = new Rect(x, -20, 10, 40, "#666", "#0000"), // Full tread
            _this.rects = [
                new Rect(x, -20, 10, 2, "#000", "#0000"),
                new Rect(x, -15, 10, 2, "#000", "#0000"),
                new Rect(x, -10, 10, 2, "#000", "#0000"),
                new Rect(x, -5, 10, 2, "#000", "#0000"),
                new Rect(x, 0, 10, 2, "#000", "#0000"),
                new Rect(x, 5, 10, 2, "#000", "#0000"),
                new Rect(x, 10, 10, 2, "#000", "#0000"),
                new Rect(x, 15, 10, 2, "#000", "#0000")
            ];
        /*
          Counter states:
          0 - [11000 11000 11000 11000 11000 11000 11000]
          1 - [01100 01100 01100 01100 01100 01100 01100]
          2 - [00110 00110 00110 00110 00110 00110 00110]
          3 - [00011 00011 00011 00011 00011 00011 00011]
          4 - [10001 10001 10001 10001 10001 10001 10001]
          5 - rolls over to 0...
        */
        _this.counter = new Counter(0, 1, 5);
        _this.counter.setParent(_this);
        _this.counter.onInc = function () {
            var frst;
            var last;
            var moveUp = function (rect) { rect.y++; return rect; };
            switch (_this.counter.get()) {
                case 4: // on increase, previous state was 3
                    // remove last tread, change height, push back
                    last = _this.rects.pop();
                    last.h = 1;
                    _this.rects.push(last);
                    // move treads
                    _this.rects.map(moveUp);
                    // new tread, height = 1, very bottom
                    frst = new Rect(_this.x, -20, 10, 1, "#000", "#0000");
                    _this.rects.unshift(frst);
                    break;
                case 0: // on increase, previous state was 4
                    // delete last tread
                    _this.rects.pop();
                    // get first tread (only 1 pixel high)
                    frst = _this.rects.shift();
                    frst.h = 2;
                    // move treads up 1
                    _this.rects.map(moveUp);
                    // put back frst into array
                    _this.rects.unshift(frst);
                    break;
                default:
                    _this.rects.map(moveUp);
                    break;
            }
        };
        _this.counter.onDec = function () {
            var frst;
            var last;
            var moveDown = function (rect) { rect.y--; return rect; };
            switch (_this.counter.get()) {
                case 4: // on decrease, previous state was 0
                    // take first element, change height
                    frst = _this.rects.shift();
                    frst.h = 1;
                    // change treads, put back first
                    _this.rects.map(moveDown);
                    _this.rects.unshift(frst);
                    // create and add new last tread
                    last = new Rect(_this.x, 19, 10, 1, "#000", "#0000");
                    _this.rects.push(last);
                    break;
                case 3: // on decrease, previous state was 4
                    // delete the bottom tread
                    _this.rects.shift();
                    // get last tread, change height, push back
                    last = _this.rects.pop();
                    last.h = 2;
                    _this.rects.push(last);
                    // move treads down 1
                    _this.rects.map(moveDown);
                    break;
                default:
                    _this.rects.map(moveDown);
                    break;
            }
        };
        return _this;
    }
    return Tread;
}(Animated));
var TankSprite = /** @class */ (function (_super) {
    __extends(TankSprite, _super);
    function TankSprite(color) {
        if (color === void 0) { color = "#c00"; }
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            if (_this.showHitbox) {
                _this.hitbox.render(ctx);
            }
            _this.getItems().map(function (item) { item.render(ctx); });
        };
        _this.getItems = function () {
            return [_this.leftTread, _this.rightTread,
                _this.body, _this.barrel,
                _this.cap, _this.turret];
        };
        _this.changeColor = function (color) {
            _this.getItems().map(function (item) {
                if (item instanceof Shape) {
                    item.color = color;
                }
            });
        };
        _this.moveTreadsForward = function (delta) {
            if (delta === void 0) { delta = 0; }
            _this.leftTread.shiftDown(delta);
            _this.rightTread.shiftDown(delta);
        };
        _this.moveTreadsBackward = function (delta) {
            if (delta === void 0) { delta = 0; }
            _this.leftTread.shiftUp(delta);
            _this.rightTread.shiftUp(delta);
        };
        _this.moveTreadsRight = function (delta) {
            if (delta === void 0) { delta = 0; }
            _this.leftTread.shiftDown(delta);
            _this.rightTread.shiftUp(delta);
        };
        _this.moveTreadsLeft = function (delta) {
            if (delta === void 0) { delta = 0; }
            _this.leftTread.shiftUp(delta);
            _this.rightTread.shiftDown(delta);
        };
        _this.hitbox = new Rect(-20, -20, 40, 40, "#ccc", "#000");
        _this.leftTread = new Tread(-17.5);
        _this.rightTread = new Tread(7.5);
        _this.body = new RoundRect(-12.5, -20, 25, 40, 2.5, color, "#000");
        _this.barrel = new Rect(-5, -20, 10, 25, color, "#000");
        _this.cap = new Rect(-7.5, -25, 15, 7.5, color, "#000");
        _this.turret = new Circle(0, 0, 10, color, "#000");
        return _this;
    }
    return TankSprite;
}(Renderable));
var BulletSprite = /** @class */ (function (_super) {
    __extends(BulletSprite, _super);
    function BulletSprite(x, y, dir) {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.save();
            _this.hitbox.render(ctx);
            ctx.fillStyle = "#999";
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.moveTo(-5, 5);
            ctx.lineTo(5, 5);
            ctx.lineTo(5, -10);
            ctx.arc(0, -10, 5, 0, Math.PI, true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            ctx.fillStyle = "#333";
            ctx.fillRect(-4, 2, 8, 2);
            ctx.restore();
        };
        _this.update = function () {
            _this.x += 0.125 * Math.sin(_this.dir * Math.PI / 180.0);
            _this.y -= 0.125 * Math.cos(_this.dir * Math.PI / 180.0);
        };
        _this.x = x;
        _this.y = y;
        _this.dir = dir;
        _this.hitbox = new Rect(-5, -15, 10, 20);
        return _this;
    }
    return BulletSprite;
}(Animated));
