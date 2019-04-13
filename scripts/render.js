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
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
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
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Shape;
}(Renderable));
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect(x, y, w, h, color, borderColor) {
        if (color === void 0) { color = "#fff"; }
        if (borderColor === void 0) { borderColor = "#0000"; }
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.fillStyle = _this.color;
            ctx.fillRect(_this.x, _this.y, _this.w, _this.h);
            ctx.strokeStyle = _this.borderColor;
            ctx.strokeRect(_this.x, _this.y, _this.w, _this.h);
            return;
        };
        _this.x = x;
        _this.y = y;
        _this.w = w;
        _this.h = h;
        _this.color = color;
        _this.borderColor = borderColor;
        return _this;
    }
    return Rect;
}(Shape));
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(x, y, radius, color) {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.fillStyle = _this.color;
            ctx.arc(_this.x, _this.y, _this.radius, 0, Math.PI * 2, true);
            ctx.fill();
            return;
        };
        _this.x = x;
        _this.y = y;
        _this.radius = radius;
        _this.color = color;
        return _this;
    }
    return Circle;
}(Shape));
var Animated = /** @class */ (function (_super) {
    __extends(Animated, _super);
    function Animated() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Animated;
}(Renderable));
var Tread = /** @class */ (function (_super) {
    __extends(Tread, _super);
    function Tread(x) {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            _this.mainRect.render(ctx);
            _this.rects.map(function (rect) { rect.render(ctx); });
        };
        _this.x = x;
        _this.mainRect = new Rect(x, -15, 10, 30, "#666", "#0000"), // Full tread
            _this.rects = [
                new Rect(x, -15, 10, 2, "#000", "#0000"),
                new Rect(x, -10, 10, 2, "#000", "#0000"),
                new Rect(x, -5, 10, 2, "#000", "#0000"),
                new Rect(x, 0, 10, 2, "#000", "#0000"),
                new Rect(x, 5, 10, 2, "#000", "#0000"),
                new Rect(x, 10, 10, 2, "#000", "#0000")
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
                    frst = new Rect(_this.x, -15, 10, 1, "#000", "#0000");
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
                    last = new Rect(_this.x, 14, 10, 1, "#000", "#0000");
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
var Sprite = /** @class */ (function (_super) {
    __extends(Sprite, _super);
    function Sprite() {
        var _this = _super.call(this) || this;
        _this.addShape = function (item) {
            _this.items.push(item);
            return;
        };
        _this.render = function (ctx) {
            _this.items;
            for (var i = 0; i < _this.items.length; i++) {
                _this.items[i].render(ctx);
            }
            return;
        };
        _this.items = [];
        return _this;
    }
    return Sprite;
}(Renderable));
/******************************************************************************/
var canvas;
var ctx;
var tank = new Sprite();
[new Tread(-15),
    new Tread(5),
    new Rect(-5, -20, 11, 35, "#f00", "#000")].map(function (x) { tank.addShape(x); });
var interval;
var degs;
var degDisplay;
var delta;
var keys = {
    "ArrowUp": false,
    "ArrowDown": false,
    "ArrowLeft": false,
    "ArrowRight": false
};
var getContext = function (canvas) {
    var ctx = canvas.getContext("2d");
    if (ctx instanceof CanvasRenderingContext2D)
        return ctx;
};
var main = function () {
    canvas = document.getElementById("canvas");
    if (!(canvas instanceof HTMLCanvasElement))
        return;
    degDisplay = document.querySelector("input#deg");
    if (!(degDisplay instanceof HTMLInputElement))
        return;
    ctx = getContext(canvas);
    degs = 0.0;
    delta = 0.5;
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    interval = setInterval(loop, Math.floor(1000 / 64));
};
var loop = function () {
    processInput();
    render();
    degDisplay.value = degs;
};
var processInput = function () {
    var leftTread = tank.items[0];
    var rightTread = tank.items[1];
    if (!(leftTread instanceof Tread) || !(rightTread instanceof Tread))
        return;
    if (keys["ArrowUp"]) {
        leftTread.counter.dec();
        rightTread.counter.dec();
    }
    if (keys["ArrowDown"]) {
        leftTread.counter.inc();
        rightTread.counter.inc();
    }
    if (keys["ArrowLeft"]) {
        degs -= 1.0;
        leftTread.counter.inc();
        rightTread.counter.dec();
    }
    if (keys["ArrowRight"]) {
        degs += 1.0;
        leftTread.counter.dec();
        rightTread.counter.inc();
    }
};
var keyDownHandler = function (evt) {
    keys[evt.key] = true;
    return;
};
var keyUpHandler = function (evt) {
    keys[evt.key] = false;
    return;
};
var render = function () {
    ctx.save();
    ctx.clearRect(0, 0, 300, 300);
    ctx.scale(3, 3);
    ctx.translate(60, 60);
    ctx.rotate(degs / 180.0 * Math.PI);
    tank.render(ctx);
    ctx.restore();
};
