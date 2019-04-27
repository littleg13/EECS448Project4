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
        this.resize = function () { };
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
        this.onInc = function () { };
        this.onDec = function () { };
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
var Path = /** @class */ (function (_super) {
    __extends(Path, _super);
    function Path(initX, initY, color, borderColor) {
        if (initX === void 0) { initX = 0; }
        if (initY === void 0) { initY = 0; }
        if (color === void 0) { color = "#f00"; }
        if (borderColor === void 0) { borderColor = "#000"; }
        var _this = _super.call(this, color, borderColor) || this;
        _this.addSegments = function (segments) {
            segments.forEach(function (segment) { _this.addSegment(segment); });
        };
        _this.addSegment = function (segment) {
            _this.segments.push(segment);
        };
        _this.removeSegment = function () {
            return _this.segments.pop();
        };
        _this.render = function (ctx) {
            ctx.beginPath();
            ctx.moveTo(_this.initX, _this.initY);
            _this.segments.forEach(function (segment) {
                segment.render(ctx);
            });
            ctx.closePath();
            ctx.fillStyle = _this.color;
            ctx.fill();
            ctx.strokeStyle = _this.borderColor;
            ctx.stroke();
        };
        _this.initX = initX;
        _this.initY = initY;
        _this.segments = [];
        return _this;
    }
    return Path;
}(Shape));
var PathSegment = /** @class */ (function (_super) {
    __extends(PathSegment, _super);
    function PathSegment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PathSegment;
}(Renderable));
var LineSegment = /** @class */ (function (_super) {
    __extends(LineSegment, _super);
    function LineSegment(x, y) {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.lineTo(_this.x, _this.y);
        };
        _this.x = x;
        _this.y = y;
        return _this;
    }
    return LineSegment;
}(PathSegment));
var ArcSegment = /** @class */ (function (_super) {
    __extends(ArcSegment, _super);
    function ArcSegment(x, y, r, startAngle, endAngle, antiClockwise) {
        if (startAngle === void 0) { startAngle = 0.0; }
        if (endAngle === void 0) { endAngle = Math.PI * 2; }
        if (antiClockwise === void 0) { antiClockwise = false; }
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.arc(_this.x, _this.y, _this.r, _this.startAngle, _this.endAngle, _this.antiClockwise);
        };
        _this.x = x;
        _this.y = y;
        _this.r = r;
        _this.startAngle = startAngle;
        _this.endAngle = endAngle;
        _this.antiClockwise = antiClockwise;
        return _this;
    }
    return ArcSegment;
}(PathSegment));
var ArcToSegment = /** @class */ (function (_super) {
    __extends(ArcToSegment, _super);
    function ArcToSegment(x1, y1, x2, y2, rad) {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.arcTo(_this.x1, _this.y1, _this.x2, _this.y2, _this.rad);
        };
        _this.x1 = x1;
        _this.y1 = y1;
        _this.x2 = x2;
        _this.y2 = y2;
        _this.rad = rad;
        return _this;
    }
    return ArcToSegment;
}(PathSegment));
var QuadraticSegment = /** @class */ (function (_super) {
    __extends(QuadraticSegment, _super);
    function QuadraticSegment(cx, cy, x, y) {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.quadraticCurveTo(_this.cx, _this.cy, _this.x, _this.y);
        };
        _this.cx = cx;
        _this.cy = cy;
        _this.x = x;
        _this.y = y;
        return _this;
    }
    return QuadraticSegment;
}(PathSegment));
var BezierSegment = /** @class */ (function (_super) {
    __extends(BezierSegment, _super);
    function BezierSegment(cx1, cy1, cx2, cy2, x, y) {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            ctx.bezierCurveTo(_this.cx1, _this.cy1, _this.cx2, _this.cy2, _this.x, _this.y);
        };
        _this.cx1 = cx1;
        _this.cy1 = cy1;
        _this.cx2 = cx2;
        _this.cy2 = cy2;
        _this.x = x;
        _this.y = y;
        return _this;
    }
    return BezierSegment;
}(PathSegment));
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
var Collection = /** @class */ (function (_super) {
    __extends(Collection, _super);
    function Collection(items) {
        if (items === void 0) { items = []; }
        var _this = _super.call(this) || this;
        _this.mapItems = function (f) {
            _this.items = _this.items.map(f);
        };
        _this.addItems = function (items) {
            items.forEach(function (item) { _this.addItem(item); });
            return;
        };
        _this.addItem = function (item) {
            _this.items.push(item);
            return;
        };
        _this.render = function (ctx) {
            _this.items.forEach(function (item) {
                item.render(ctx);
            });
            return;
        };
        _this.items = items;
        return _this;
    }
    return Collection;
}(Renderable));
