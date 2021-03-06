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
var Hitbox = /** @class */ (function () {
    function Hitbox(xOffset, yOffset, w, h) {
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.w = w;
        this.h = h;
    }
    return Hitbox;
}());
var Sprite = /** @class */ (function (_super) {
    __extends(Sprite, _super);
    function Sprite() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Sprite;
}(Animated));
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
}(Sprite));
var TankSprite = /** @class */ (function (_super) {
    __extends(TankSprite, _super);
    function TankSprite(color) {
        if (color === void 0) { color = "#c00"; }
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            if (_this.multiShot) {
                _this.leftTread.render(ctx);
                _this.rightTread.render(ctx);
                _this.body.render(ctx);
                _this.getAuxBarrel().render(ctx);
                ctx.save();
                ctx.rotate(Math.PI / 6);
                _this.getAuxBarrel().render(ctx);
                ctx.restore();
                ctx.save();
                ctx.rotate(-Math.PI / 6);
                _this.getAuxBarrel().render(ctx);
                ctx.restore();
                _this.turret.render(ctx);
            }
            else {
                _this.getItems().forEach(function (item) { item.render(ctx); });
            }
        };
        _this.getItems = function () {
            return [_this.leftTread, _this.rightTread,
                _this.body, _this.barrel,
                _this.cap, _this.turret];
        };
        _this.setMulti = function (num) {
            _this.multiShot = (num > 0);
        };
        _this.getAuxBarrel = function () {
            return new Collection([
                new Rect(-4, -22.5, 8, 20, _this.color, "#000"),
                new RoundRect(-7, -27.5, 14, 5, 2.5, _this.color, "#000")
            ]);
        };
        _this.getDim = function () {
            return [_this.width, _this.height];
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
        _this.width = 40;
        _this.height = 40;
        _this.hitbox = new Hitbox(-17.5, -20, 35, 40);
        _this.leftTread = new Tread(-17.5);
        _this.rightTread = new Tread(7.5);
        _this.body = new RoundRect(-12.5, -20, 25, 40, 3, color, "#000");
        _this.barrel = new Rect(-5, -20, 10, 25, color, "#000");
        _this.cap = new RoundRect(-7.5, -25, 15, 7.5, 2.5, color, "#000");
        _this.turret = new Circle(0, 0, 10, color, "#000");
        _this.color = color;
        _this.multiShot = false;
        return _this;
    }
    return TankSprite;
}(Sprite));
var NameTag = /** @class */ (function (_super) {
    __extends(NameTag, _super);
    function NameTag(playerName, health) {
        if (health === void 0) { health = 100; }
        var _this = _super.call(this) || this;
        _this.updateHealth = function (health) {
            _this.healthFill.w = 36 * health / 100;
        };
        _this.render = function (ctx) {
            //    ctx.font = "0.75em Consolas";
            //    ctx.fillText( this.playerName, -20, 0 );
            _this.healthBar.render(ctx);
            _this.healthFill.render(ctx);
        };
        while (playerName.indexOf("&lt;") != -1
            || playerName.indexOf("&gt;") != -1) {
            playerName = playerName.replace("&gt;", ">").replace("&lt;", "<");
        }
        _this.playerName = playerName;
        _this.healthBar = new RoundRect(-20, 10, 40, 10, 5, "black");
        _this.healthFill = new RoundRect(-18, 12.5, 36 * (health / 100), 5, 2.5, "red");
        return _this;
    }
    return NameTag;
}(Renderable));
var BulletSprite = /** @class */ (function (_super) {
    __extends(BulletSprite, _super);
    function BulletSprite() {
        var _this = _super.call(this) || this;
        _this.getDim = function () {
            return [_this.width, _this.height];
        };
        _this.render = function (ctx) {
            ctx.save();
            _this.body.render(ctx);
            ctx.fillStyle = "#333";
            ctx.fillRect(-4, 2, 8, 2);
            ctx.restore();
        };
        _this.width = 40;
        _this.height = 40;
        _this.hitbox = new Hitbox(0, -15, 0, 25);
        _this.body = new Path(-5, 5, "#606060");
        var segments = [
            new LineSegment(5, 5),
            new LineSegment(5, -10),
            new ArcSegment(0, -10, 5, 0.0, Math.PI, true)
        ];
        _this.body.addSegments(segments);
        return _this;
    }
    return BulletSprite;
}(Sprite));
var ShadowBlock = /** @class */ (function (_super) {
    __extends(ShadowBlock, _super);
    function ShadowBlock() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            _this.items.render(ctx);
        };
        var items = [
            new RoundRect(0, 0, 40, 40, 3, "rgba( 0, 0, 0, 0.5 )", "transparent"),
            new RoundRect(1, 2, 18, 7, 3, "rgba( 112, 112, 112, 0.5 )", "transparent"),
            new RoundRect(21, 2, 18, 7, 3, "rgba( 112, 112, 112, 0.5 )", "transparent"),
            new RoundRect(1, 11, 8, 7, 3, "rgba( 80, 80, 80, 0.5 )", "transparent"),
            new RoundRect(11, 11, 18, 7, 3, "rgba( 80, 80, 80, 0.5 )", "transparent"),
            new RoundRect(31, 11, 8, 7, 3, "rgba( 80, 80, 80, 0.5 )", "transparent"),
            new RoundRect(1, 20, 18, 7, 3, "rgba( 48, 48, 48, 0.5 )", "transparent"),
            new RoundRect(21, 20, 18, 7, 3, "rgba( 48, 48, 48, 0.5 )", "transparent"),
            new RoundRect(1, 29, 8, 7, 3, "rgba( 16, 16, 16, 0.5 )", "transparent"),
            new RoundRect(11, 29, 18, 7, 3, "rgba( 16, 16, 16, 0.5 )", "transparent"),
            new RoundRect(31, 29, 8, 7, 3, "rgba( 16, 16, 16, 0.5 )", "transparent")
        ];
        _this.items = new Collection(items);
        return _this;
    }
    return ShadowBlock;
}(Sprite));
var ExplosionSprite = /** @class */ (function (_super) {
    __extends(ExplosionSprite, _super);
    function ExplosionSprite() {
        var _this = _super.call(this) || this;
        _this.update = function () {
            var count = _this.counter.get();
            var growth = _this.growth * count / _this.counter.max;
            if (count == 0) {
                return true;
            }
            _this.radii1 = _this.radii1.map(function (p) {
                var innerR = p.x;
                var outerR = p.y;
                return new Point(innerR + growth, outerR + growth);
            });
            _this.radii2 = _this.radii2.map(function (p) {
                var innerR = p.x;
                var outerR = p.y;
                return new Point(innerR + growth / 2, outerR + growth / 2);
            });
            _this.counter.dec();
            return false;
        };
        _this.render = function (ctx) {
            var a = _this.counter.get() / _this.counter.max;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, -_this.radii1[0].x);
            _this.radii1.forEach(function (p) {
                var innerR = p.x;
                var outerR = p.y;
                ctx.lineTo(0, -innerR);
                ctx.rotate(2 * Math.PI / _this.numPoints);
                ctx.lineTo(0, -outerR);
                ctx.rotate(2 * Math.PI / _this.numPoints);
            });
            ctx.lineTo(0, -_this.radii1[0].x);
            ctx.closePath();
            ctx.fillStyle = "rgba( 255, 0, 0, " + a + " )";
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            _this.radii2.forEach(function (p) {
                var innerR = p.x;
                var outerR = p.y;
                ctx.lineTo(0, -innerR);
                ctx.rotate(2 * Math.PI / _this.numPoints);
                ctx.lineTo(0, -outerR);
                ctx.rotate(2 * Math.PI / _this.numPoints);
            });
            ctx.lineTo(0, -_this.radii2[0].x);
            ctx.closePath();
            ctx.fillStyle = "rgba( 255, 255, 0, " + a + " )";
            ctx.fill();
            ctx.restore();
        };
        _this.width = 40;
        _this.height = 40;
        _this.radii1 = [];
        _this.radii2 = [];
        _this.innerVar = 10;
        _this.outerVar = 10;
        _this.growth = 1;
        _this.numPoints = 32;
        _this.counter = new Counter(0, 1, 32);
        _this.counter.dec();
        var innerR = 10;
        var outerR = 20;
        for (var i = 0; i < _this.numPoints / 2; i++) {
            var p1 = new Point(innerR, outerR);
            var p2 = new Point(innerR / 2, outerR / 2);
            p1.x += (Math.random() - 0.5) * _this.innerVar;
            p1.y += (Math.random() - 0.5) * _this.outerVar;
            p2.x += (Math.random() - 0.5) * _this.innerVar / 2;
            p2.y += (Math.random() - 0.5) * _this.outerVar / 2;
            _this.radii1.push(p1);
            _this.radii2.push(p2);
        }
        return _this;
    }
    return ExplosionSprite;
}(Sprite));
var MultiShotSprite = /** @class */ (function (_super) {
    __extends(MultiShotSprite, _super);
    function MultiShotSprite() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            _this.box.render(ctx);
            ctx.save();
            ctx.translate(0, 10); // set up for rotations
            ctx.save();
            ctx.rotate(Math.PI / 6);
            _this.turret1.render(ctx);
            ctx.restore();
            ctx.save();
            ctx.rotate(-Math.PI / 6);
            _this.turret2.render(ctx);
            ctx.restore();
            ctx.save();
            ctx.translate(0, -3);
            _this.turret3.render(ctx);
            ctx.restore();
            _this.hub.render(ctx);
            ctx.restore();
        };
        _this.width = 40;
        _this.height = 40;
        _this.box = new RoundRect(-18, -18, 36, 36, 10, "#336", "#669").setBorderWidth(2);
        var genTurret = function () {
            return new Collection([
                new Rect(-3, -20, 6, 15, "#99c", "transparent").setBorderWidth(2),
                new Rect(-5, -23, 10, 4, "#669", "transparent").setBorderWidth(2)
            ]);
        };
        _this.turret1 = genTurret();
        _this.turret2 = genTurret();
        _this.turret3 = genTurret();
        _this.hub = new Circle(0, -3, 8, "#669", "transparent").setBorderWidth(2);
        return _this;
    }
    return MultiShotSprite;
}(Sprite));
var BuildWallSprite = /** @class */ (function (_super) {
    __extends(BuildWallSprite, _super);
    function BuildWallSprite() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            _this.box.render(ctx);
            _this.bricks.render(ctx);
        };
        _this.width = 40;
        _this.height = 40;
        _this.box = new RoundRect(-18, -18, 36, 36, 10, "#999", "#333").setBorderWidth(2);
        _this.bricks = new Collection([
            new RoundRect(-15, -15, 18, 10, 3, "#666", "#333"),
            new RoundRect(5, -15, 10, 10, 3, "#666", "#333"),
            new RoundRect(-15, -4, 10, 8, 3, "#666", "#333"),
            new RoundRect(-3, -4, 18, 8, 3, "#666", "#333"),
            new RoundRect(-15, 5, 18, 10, 3, "#666", "#333"),
            new RoundRect(5, 5, 10, 10, 3, "#666", "#333")
        ]);
        return _this;
    }
    return BuildWallSprite;
}(Sprite));
var IncreaseMoveDistSprite = /** @class */ (function (_super) {
    __extends(IncreaseMoveDistSprite, _super);
    function IncreaseMoveDistSprite() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            _this.box.render(ctx);
            _this.arrows.render(ctx);
        };
        _this.width = 40;
        _this.height = 40;
        _this.box = new RoundRect(-18, -18, 36, 36, 10, "darkgreen", "limegreen").setBorderWidth(2);
        _this.box.setBorderWidth(2);
        _this.arrows = new Collection();
        for (var i = 0; i < 5; i++) {
            var color = "green";
            if (i % 2 == 0) {
                color = "limegreen";
            }
            var path = new Path(0, (-15 + i * 5), color, "transparent");
            path.addSegments([
                new LineSegment(-10, (-5 + i * 5)),
                new LineSegment(10, (-5 + i * 5))
            ]);
            _this.arrows.addItem(path);
        }
        return _this;
    }
    return IncreaseMoveDistSprite;
}(Sprite));
var HealthPackSprite = /** @class */ (function (_super) {
    __extends(HealthPackSprite, _super);
    function HealthPackSprite() {
        var _this = _super.call(this) || this;
        _this.render = function (ctx) {
            _this.box.render(ctx);
            _this.cross.render(ctx);
        };
        _this.width = 40;
        _this.height = 40;
        _this.box = new RoundRect(-18, -18, 36, 36, 10, "#f00", "#933").setBorderWidth(2);
        _this.cross = new Path(0, 15, "#fcc", "#933");
        _this.cross.addSegments([
            new ArcToSegment(5, 15, 5, 10, 5),
            new LineSegment(5, 5),
            new LineSegment(10, 5),
            new ArcToSegment(15, 5, 15, 0, 5),
            new ArcToSegment(15, -5, 10, -5, 5),
            new LineSegment(5, -5),
            new LineSegment(5, -10),
            new ArcToSegment(5, -15, 0, -15, 5),
            new ArcToSegment(-5, -15, -5, -10, 5),
            new LineSegment(-5, -5),
            new LineSegment(-10, -5),
            new ArcToSegment(-15, -5, -15, 0, 5),
            new ArcToSegment(-15, 5, -10, 5, 5),
            new LineSegment(-5, 5),
            new LineSegment(-5, 10),
            new ArcToSegment(-5, 15, 0, 15, 5)
        ]);
        _this.box.setBorderWidth(2);
        _this.cross.setBorderWidth(2);
        return _this;
    }
    return HealthPackSprite;
}(Sprite));
