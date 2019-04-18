/*  Overview:
 *  Class Point
 *    - x
 *    - y
 *
 *  Superclass Entity
 *    - shapes {Shapes[]}
 *    - dimension {number}
 *    - foreCtx {HTMLCanvasContext}
 *    - backCtx {HTMLCanvasContext}
 *    - render()
 *
 *  Superclass Shape
 *    - render()
 *
 *  Subclass Rect
 *    - corner {Point}
 *    - size {Point}
 *
 *  Subclass Arc
 *    - center {Point}
 *    - radius {number}
 *    - start {number} = 0
 *    - end {number} = Math.PI * 2
 *    - clockwise {bool} = true
 *
 */
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
var Counter = /** @class */ (function () {
    function Counter(initial, delta, max) {
        var _this = this;
        if (delta === void 0) { delta = 1; }
        if (max === void 0) { max = Infinity; }
        this.inc = function () {
            _this.value = (_this.value + _this.delta) % _this.max;
            _this.onInc();
        };
        this.dec = function () {
            // extra max term added bc % returns - for - numbers
            _this.value = (_this.value + _this.max - _this.delta) % _this.max;
            _this.onDec();
        };
        this.get = function () {
            return _this.value;
        };
        this.setParent = function (parent) {
            _this.parent = parent;
        };
        this.value = initial;
        this.delta = delta;
        this.max = max;
    }
    return Counter;
}());
var Renderable = /** @class */ (function () {
    function Renderable() {
    }
    return Renderable;
}());
var Animated = /** @class */ (function (_super) {
    __extends(Animated, _super);
    function Animated() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Animated;
}(Renderable));
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape(color, borderColor) {
        if (color === void 0) { color = "#fff"; }
        if (borderColor === void 0) { borderColor = "#0000"; }
        var _this = _super.call(this) || this;
        _this.color = color;
        _this.borderColor = borderColor;
        return _this;
    }
    return Shape;
}(Renderable));
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect(x, y, w, h, color, borderColor) {
        if (color === void 0) { color = "#fff"; }
        if (borderColor === void 0) { borderColor = "#0000"; }
        var _this = _super.call(this, color, borderColor) || this;
        _this.render = function (ctx) {
            ctx.fillStyle = _this.color;
            ctx.strokeStyle = _this.borderColor;
            ctx.fillRect(_this.x, _this.y, _this.w, _this.h);
            ctx.strokeRect(_this.x, _this.y, _this.w, _this.h);
            return;
        };
        _this.x = x;
        _this.y = y;
        _this.w = w;
        _this.h = h;
        return _this;
    }
    return Rect;
}(Shape));
var RoundRect = /** @class */ (function (_super) {
    __extends(RoundRect, _super);
    function RoundRect(x, y, w, h, rad, color, borderColor) {
        if (color === void 0) { color = "#fff"; }
        if (borderColor === void 0) { borderColor = "#0000"; }
        var _this = _super.call(this, x, y, w, h, color, borderColor) || this;
        _this.render = function (ctx) {
            var _a = [_this.x, _this.x + _this.w,
                _this.y, _this.y + _this.h, _this.rad], left = _a[0], right = _a[1], top = _a[2], bottom = _a[3], r = _a[4];
            ctx.fillStyle = _this.color;
            ctx.strokeStyle = _this.borderColor;
            ctx.beginPath(); // clockwise path
            ctx.moveTo(left, top + r); // begin lower top-left corner
            ctx.arcTo(left, top, // 'true' corner
            left + r, top, // end upper top-left corner
            r);
            ctx.lineTo(right - r, top); // move to upper top-right corner
            ctx.arcTo(right, top, // 'true' corner
            right, top + r, // end lower top-right corner
            r);
            ctx.lineTo(right, bottom - r); // move to upper bottom-right corner
            ctx.arcTo(right, bottom, right - r, bottom, r);
            ctx.lineTo(left + r, bottom);
            ctx.arcTo(left, bottom, left, bottom - r, r);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };
        _this.rad = Math.min(rad, w, h);
        return _this;
    }
    return RoundRect;
}(Rect));
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(x, y, radius, color, borderColor) {
        if (color === void 0) { color = "#fff"; }
        if (borderColor === void 0) { borderColor = "#0000"; }
        var _this = _super.call(this, color, borderColor) || this;
        _this.render = function (ctx) {
            ctx.fillStyle = _this.color;
            ctx.strokeStyle = _this.borderColor;
            ctx.beginPath();
            ctx.arc(_this.x, _this.y, _this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            return;
        };
        _this.x = x;
        _this.y = y;
        _this.radius = radius;
        return _this;
    }
    return Circle;
}(Shape));
var Tread = /** @class */ (function (_super) {
    __extends(Tread, _super);
    function Tread(x) {
        var _this = _super.call(this) || this;
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
    function TankSprite(x, y, dir, color) {
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
        _this.moveForward = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            var dirRads = (_this.dir / 180.0) * Math.PI;
            _this.x += Math.sin(dirRads) * delta;
            _this.y -= Math.cos(dirRads) * delta;
            _this.leftTread.counter.dec();
            _this.rightTread.counter.dec();
        };
        _this.moveBackward = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            var dirRads = (_this.dir / 180.0) * Math.PI;
            _this.x -= Math.sin(dirRads) * delta;
            _this.y += Math.cos(dirRads) * delta;
            _this.leftTread.counter.inc();
            _this.rightTread.counter.inc();
        };
        _this.rotateCW = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            _this.dir += delta;
            _this.leftTread.counter.dec();
            _this.rightTread.counter.inc();
        };
        _this.rotateCCW = function (delta) {
            if (delta === void 0) { delta = 1.0; }
            _this.dir -= delta;
            _this.leftTread.counter.inc();
            _this.rightTread.counter.dec();
        };
        _this.x = x;
        _this.y = y;
        _this.dir = dir; // stored in degrees
        _this.color = color;
        /*
         *  Set up the different shapes
         */
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
