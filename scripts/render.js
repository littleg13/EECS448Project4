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
var Layer = /** @class */ (function () {
    function Layer(id, width, height) {
        var _this = this;
        if (width === void 0) { width = 40; }
        if (height === void 0) { height = 40; }
        this.attachToParent = function (parent) {
            parent.appendChild(_this.canvas);
        };
        this.applyRotation = function (deg) {
            _this.ctx.save();
            _this.ctx.rotate(deg * Math.PI / 180.0);
        };
        this.applyTranslate = function (x, y) {
            _this.ctx.save();
            _this.ctx.translate(x, y);
        };
        this.applyScale = function (x, y) {
            _this.ctx.save();
            _this.ctx.scale(x, y);
        };
        this.popTransform = function () {
            _this.ctx.restore();
        };
        this.center = function () {
            _this.applyTranslate(_this.width / 2, _this.height / 2);
        };
        this.clear = function () {
            _this.ctx.clearRect(0, 0, _this.width, _this.height);
        };
        this.drawItem = function (item) {
            item.render(_this.ctx);
        };
        this.addLayer = function (image, dx, dy) {
            if (dx === void 0) { dx = 0; }
            if (dy === void 0) { dy = 0; }
            _this.ctx.drawImage(image.getImage(), dx, dy);
        };
        this.getImage = function () {
            return _this.canvas;
        };
        var canvas = document.createElement("canvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
            return null;
        }
        var ctx = canvas.getContext("2d");
        if (!(ctx instanceof CanvasRenderingContext2D)) {
            return null;
        }
        canvas.setAttribute("id", id);
        canvas.width = width;
        canvas.height = height;
        this.canvas = canvas;
        this.ctx = ctx;
        this.id = id;
        this.width = width;
        this.height = height;
    }
    return Layer;
}());
var Counter = /** @class */ (function () {
    function Counter(initial, delta, max) {
        var _this = this;
        if (delta === void 0) { delta = 1; }
        if (max === void 0) { max = Infinity; }
        this.inc = function (delta) {
            if (delta === void 0) { delta = 0; }
            delta = Math.max(delta, _this.delta);
            // extra max term added bc % returns - for - numbers
            for (var i = 0; i < delta; i++) {
                _this.value = (_this.value + _this.max + 1) % _this.max;
                _this.onInc();
            }
        };
        this.dec = function (delta) {
            if (delta === void 0) { delta = 0; }
            delta = Math.max(delta, _this.delta);
            // extra max term added bc % returns - for - numbers
            for (var i = 0; i < delta; i++) {
                _this.value = (_this.value + _this.max - 1) % _this.max;
                _this.onDec();
            }
        };
        this.get = function () {
            return _this.value;
        };
        this.setParent = function (parent) {
            _this.parent = parent;
        };
        this.value = initial;
        this.delta = delta;
        if (delta < 0) {
            delta = -delta;
        }
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
