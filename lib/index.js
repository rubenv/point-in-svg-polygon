var bezier3Type = "bezier3";
var lineType = "line";

var mathAbs = Math.abs;
var mathAsin = Math.asin;
var mathCos = Math.cos;
var mathMax = Math.max;
var mathMin = Math.min;
var mathPi = Math.PI;
var mathPow = Math.pow;
var mathSin = Math.sin;
var mathSqrt = Math.sqrt;
var mathTan = Math.tan;

var tolerance = 1e-6;

function x(p) {
    return p[0];
}

function y(p) {
    return p[1];
}

function toFloat(v) {
    return parseFloat(v, 10);
}

function coordEqual(c1, c2) {
    return x(c1) === x(c2) && y(c1) === y(c2);
}

function coordMax(c1, c2) {
    return [mathMax(x(c1), x(c2)), mathMax(y(c1), y(c2))];
}

function coordMin(c1, c2) {
    return [mathMin(x(c1), x(c2)), mathMin(y(c1), y(c2))];
}

function coordMultiply(c, f) {
    return [x(c) * f, y(c) * f];
}

function coordAdd(c1, c2) {
    return [x(c1) + x(c2), y(c1) + y(c2)];
}

function coordDot(c1, c2) {
    return x(c1) * x(c2) + y(c1) * y(c2);
}

function coordLerp(c1, c2, t) {
    return [x(c1) + (x(c2) - x(c1)) * t, y(c1) + (y(c2) - y(c1)) * t];
}

function linearRoot(p2, p1) {
    var results = [];

    var a = p2;
    if (a !== 0) {
        results.push(-p1 / p2);
    }

    return results;
}

function quadRoots(p3, p2, p1) {
    var results = [];

    if (mathAbs(p3) <= tolerance) {
        return linearRoot(p2, p1);
    }

    var a = p3;
    var b = p2 / a;
    var c = p1 / a;
    var d = b * b - 4 * c;
    if (d > 0) {
        var e = mathSqrt(d);
        results.push(0.5 * (-b + e));
        results.push(0.5 * (-b - e));
    } else if (d === 0) {
        results.push(0.5 * -b);
    }

    return results;
}

function cubeRoots(p4, p3, p2, p1) {
    if (mathAbs(p4) <= tolerance) {
        return quadRoots(p3, p2, p1);
    }

    var results = [];

    var c3 = p4;
    var c2 = p3 / c3;
    var c1 = p2 / c3;
    var c0 = p1 / c3;

    var a = (3 * c1 - c2 * c2) / 3;
    var b = (2 * c2 * c2 * c2 - 9 * c1 * c2 + 27 * c0) / 27;
    var offset = c2 / 3;
    var discrim = b * b / 4 + a * a * a / 27;
    var halfB = b / 2;

    /* This should be here, but there's a typo in the original code (disrim =
     * 0) which causes it not to be present there. Ironically, adding the
     * following code breaks the algorithm, whereas leaving it out makes it
     * work correctly.
    if (mathAbs(discrim) <= tolerance) {
        discrim = 0;
    }
    */

    var tmp;
    if (discrim > 0) {
        var e = mathSqrt(discrim);
        tmp = -halfB + e;
        var root = tmp >= 0 ? mathPow(tmp, 1 / 3) : -mathPow(-tmp, 1 / 3);
        tmp = -halfB - e;
        if (tmp >= 0) {
            root += mathPow(tmp, 1 / 3);
        } else {
            root -= mathPow(-tmp, 1 / 3);
        }
        results.push(root - offset);
    } else if (discrim < 0) {
        var distance = mathSqrt(-a / 3);
        var angle = Math.atan2(mathSqrt(-discrim), -halfB) / 3;
        var cos = mathCos(angle);
        var sin = mathSin(angle);
        var sqrt3 = mathSqrt(3);
        results.push(2 * distance * cos - offset);
        results.push(-distance * (cos + sqrt3 * sin) - offset);
        results.push(-distance * (cos - sqrt3 * sin) - offset);
    } else {
        if (halfB >= 0)  {
            tmp = -mathPow(halfB, 1 / 3);
        } else {
            tmp = mathPow(-halfB, 1 / 3);
        }
        results.push(2 * tmp - offset);
        results.push(-tmp - offset);
    }

    return results;
}

function arcToCurve(cp1, rx, ry, angle, large_arc, sweep, cp2, recurse) {
    function rotate(cx, cy, r) {
        var cos = mathCos(r);
        var sin = mathSin(r);
        return [
            cx * cos - cy * sin,
            cx * sin + cy * cos,
        ];
    }

    var x1 = x(cp1);
    var y1 = y(cp1);
    var x2 = x(cp2);
    var y2 = y(cp2);

    var rad = mathPi / 180 * (+angle || 0);
    var f1 = 0;
    var f2 = 0;
    var cx;
    var cy;
    var res = [];

    if (!recurse) {
        var xy = rotate(x1, y1, -rad);
        x1 = x(xy);
        y1 = y(xy);
        xy = rotate(x2, y2, -rad);
        x2 = x(xy);
        y2 = y(xy);

        var px = (x1 - x2) / 2;
        var py = (y1 - y2) / 2;
        var h = (px * px) / (rx * rx) + (py * py) / (ry * ry);
        if (h > 1) {
            h = mathSqrt(h);
            rx = h * rx;
            ry = h * ry;
        }

        var rx2 = rx * rx;
        var ry2 = ry * ry;

        var k = (large_arc === sweep ? -1 : 1)
            * mathSqrt(mathAbs((rx2 * ry2 - rx2 * py * py - ry2 * px * px) / (rx2 * py * py + ry2 * px * px)));

        cx = k * rx * py / ry + (x1 + x2) / 2;
        cy = k * -ry * px / rx + (y1 + y2) / 2;
        f1 = mathAsin(((y1 - cy) / ry).toFixed(9));
        f2 = mathAsin(((y2 - cy) / ry).toFixed(9));

        f1 = x1 < cx ? mathPi - f1 : f1;
        f2 = x2 < cx ? mathPi - f2 : f2;

        if (f1 < 0) {
            f1 = mathPi * 2 + f1;
        }
        if (f2 < 0) {
            f2 = mathPi * 2 + f2;
        }
        if (sweep && f1 > f2) {
            f1 = f1 - mathPi * 2;
        }
        if (!sweep && f2 > f1) {
            f2 = f2 - mathPi * 2;
        }
    } else {
        f1 = recurse[0];
        f2 = recurse[1];
        cx = recurse[2];
        cy = recurse[3];
    }

    var df = f2 - f1;
    if (mathAbs(df) > mathPi * 120 / 180) {
        var f2old = f2;
        var x2old = x2;
        var y2old = y2;

        f2 = f1 + mathPi * 120 / 180 * (sweep && f2 > f1 ? 1 : -1);
        x2 = cx + rx * mathCos(f2);
        y2 = cy + ry * mathSin(f2);
        res = arcToCurve([x2, y2], rx, ry, angle, 0, sweep, [x2old, y2old], [f2, f2old, cx, cy]);
    }

    df = f2 - f1;

    var c1 = mathCos(f1);
    var s1 = mathSin(f1);
    var c2 = mathCos(f2);
    var s2 = mathSin(f2);
    var t = mathTan(df / 4);
    var hx = 4 / 3 * rx * t;
    var hy = 4 / 3 * ry * t;
    var m1 = [x1, y1];
    var m2 = [x1 + hx * s1, y1 - hy * c1];
    var m3 = [x2 + hx * s2, y2 - hy * c2];
    var m4 = [x2, y2];
    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];

    function splitCurves(curves) {
        var result = [];
        while (curves.length > 0) {
            result.push([
                [curves[0], curves[1]],
                [curves[2], curves[3]],
                [curves[4], curves[5]],
            ]);
            curves.splice(0, 6);
        }
        return result;
    }

    if (recurse) {
        return splitCurves([m2, m3, m4].concat(res));
    } else {
        res = [m2, m3, m4].concat(res).join().split(",");
        var newres = [];
        for (var i = 0, ii = res.length; i < ii; i++) {
            newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad)[1] : rotate(res[i], res[i + 1], rad)[0];
        }
        return splitCurves(newres);
    }
}

// Unpack an SVG path string into different curves and lines
//
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
function splitSegments(polygon) {
    if (typeof polygon !== "string") {
        throw new Error("Polygon should be a path string");
    }

    var start = null;
    var position = null;
    var result = [];

    function stripWhitespace() {
        polygon = polygon.trim();
    }

    function readCharSeq(n) {
        var c = polygon.charCodeAt(n);
        while (c >= 48 && c <= 57) {
            n++;
            c = polygon.charCodeAt(n);
        }
        return n;
    }

    function readNumber() {
        stripWhitespace();

        var start = 0;
        var end = 0;
        if (polygon[start] === ",") {
            start++;
            end++;
        }

        if (polygon[start] === "-") {
            end++;
        }

        end = readCharSeq(end);
        if (polygon[end] === ".") {
            end++;
            end = readCharSeq(end);
        }

        var s = polygon.substring(start, end);
        if (s !== "") {
            var num = toFloat(s);
            polygon = polygon.substring(end);
            if (polygon.length && polygon[0].toLowerCase() === "e") {
                var f = 1;
                var expEnd = 0;
                if (polygon.length > 1 && polygon[1] === "-") {
                    f = -1;
                    expEnd = readCharSeq(2);
                } else {
                    expEnd = readCharSeq(1);
                }
                var exp = toFloat(polygon.substring(1, expEnd));
                if (mathAbs(exp) > 0) {
                    num *= mathPow(10, exp);
                }
                polygon = polygon.substring(expEnd);
            }
            return num;
        } else {
            throw new Error("Expected number: " + polygon);
        }
    }

    function readNumbers(n, fn) {
        stripWhitespace();
        var index = 0;
        var c = polygon.charCodeAt(0);
        while ((c >= 48 && c <= 57) || c === 44 || c === 45) {
            var numbers = [];
            for (var i = 0; i < n; i++) {
                numbers.push(readNumber());
            }
            fn(numbers, index);

            stripWhitespace();
            c = polygon.charCodeAt(0);
            index++;
        }
    }

    function readCoords(n, fn) {
        readNumbers(n * 2, function (numbers, index) {
            var coords = [];
            for (var i = 0; i < n; i++) {
                coords.push(numbers.splice(0, 2));
            }
            fn(coords, index);
        });
    }

    function pushType(itemType, offset) {
        return function (c) {
            if (offset) {
                c = c.map(function (c) {
                    return [x(c) + x(offset), y(c) + y(offset)];
                });
            }
            c.unshift(position);
            result.push({
                type: itemType,
                coords: c,
            });
            position = c[c.length - 1];
        };
    }

    function calculateCubicControlPoints(coords) {
        return [coords[0], [
          x(coords[0]) + 2.0 / 3.0 * (x(coords[1]) - x(coords[0])),
          y(coords[0]) + 2.0 / 3.0 * (y(coords[1]) - y(coords[0])),
        ], [
          x(coords[2]) + 2.0 / 3.0 * (x(coords[1]) - x(coords[2])),
          y(coords[2]) + 2.0 / 3.0 * (y(coords[1]) - y(coords[2])),
        ], coords[2],
        ];
    }

    function calculateBezierControlPoint() {
        var lastBezier = result[result.length - 1];
        var controlPoint = null;
        if (!lastBezier || lastBezier.type !== bezier3Type) {
            controlPoint = position;
        } else {
            // Calculate the mirror point of the last control point
            var lastPoint = lastBezier.coords[2];
            var xOffset = x(position) - x(lastPoint);
            var yOffset = y(position) - y(lastPoint);

            controlPoint = [x(position) + xOffset, y(position) + yOffset];
        }

        return controlPoint;
    }

    function handleArcSegment(relative) {
        readNumbers(7, function (numbers) {
            var c2 = coordAdd(numbers.slice(5, 7), relative);
            var args = [position].concat(numbers.slice(0, 5)).concat([c2]);
            var curve = arcToCurve.apply(null, args);
            for (var i = 0; i < curve.length; i++) {
                pushType(bezier3Type)(curve[i]);
            }
        });
    }

    function readSegment() {
        stripWhitespace();
        if (polygon === "") {
            return;
        }

        var operator = polygon[0];
        polygon = polygon.substring(1);

        var pushLine = pushType(lineType);
        var origin = [0, 0];

        switch (operator) {
        case "M":
            readCoords(1, function (c, i) {
                if (i === 0) {
                    position = c[0];
                    if (!start) {
                        start = position;
                    }
                } else {
                    pushType(lineType)(c);
                }
            });
            break;
        case "m":
            readCoords(1, function (c, i) {
                if (i === 0) {
                    if (!position) {
                        position = c[0];
                    } else {
                        position = coordAdd(c, position);
                    }

                    if (!start) {
                        start = position;
                    }
                } else {
                    var c0 = c[0];
                    pushType(lineType)([coordAdd(c0, position)]);
                }
            });
            break;
        case "C":
            readCoords(3, pushType(bezier3Type));
            break;
        case "c":
            readCoords(3, pushType(bezier3Type, position));
            break;
        case "Q":
            readCoords(2, function (coords) {
                coords.unshift(position);
                coords = calculateCubicControlPoints(coords);
                coords.shift();
                pushType(bezier3Type)(coords);
            });
            break;
        case "q":
            readCoords(2, function (coords) {
                coords = coords.map(function (c) { return coordAdd(c, position); });
                coords.unshift(position);
                coords = calculateCubicControlPoints(coords);
                coords.shift();
                pushType(bezier3Type)(coords);
            });
            break;
        case "S":
            readCoords(2, function (coords) {
                var controlPoint = calculateBezierControlPoint();
                coords.unshift(controlPoint);
                pushType(bezier3Type)(coords);
            });
            break;
        case "s":
            readCoords(2, function (coords) {
                var controlPoint = calculateBezierControlPoint();
                coords = coords.map(function (c) { return coordAdd(c, position); });
                coords.unshift(controlPoint);
                pushType(bezier3Type)(coords);
            });
            break;
        case "A":
            handleArcSegment(origin);
            break;
        case "a":
            handleArcSegment(position);
            break;
        case "L":
            readCoords(1, pushType(lineType));
            break;
        case "l":
            readCoords(1, function (c) {
                pushLine([[x(c[0]) + x(position), y(c[0]) + y(position)]]);
            });
            break;
        case "H":
            pushType(lineType)([[readNumber(), y(position)]]);
            break;
        case "h":
            pushType(lineType, position)([[readNumber(), 0]]);
            break;
        case "V":
            pushType(lineType)([[x(position), readNumber()]]);
            break;
        case "v":
            pushType(lineType, position)([[0, readNumber()]]);
            break;
        case "Z":
        case "z":
            if (!coordEqual(position, start)) {
                pushType(lineType)([start]);
            }
            break;
        default:
            throw new Error("Unknown operator: " + operator);
        } // jscs:ignore validateIndentation
        // ^ (jscs bug)
    }

    while (polygon.length > 0) {
        readSegment();
    }

    // Remove zero-length lines
    for (var i = 0; i < result.length; i++) {
        var segment = result[i];
        if (segment.type === lineType && coordEqual(segment.coords[0], segment.coords[1])) {
            result.splice(i, 1);
            i--;
        }
    }

    return result;
}

function intersectBezier3Line(p1, p2, p3, p4, a1, a2) {
    var result = [];

    var min = coordMin(a1, a2); // used to determine if point is on line segment
    var max = coordMax(a1, a2); // used to determine if point is on line segment

    // Start with Bezier using Bernstein polynomials for weighting functions:
    //     (1-t^3)P1 + 3t(1-t)^2P2 + 3t^2(1-t)P3 + t^3P4
    //
    // Expand and collect terms to form linear combinations of original Bezier
    // controls.  This ends up with a vector cubic in t:
    //     (-P1+3P2-3P3+P4)t^3 + (3P1-6P2+3P3)t^2 + (-3P1+3P2)t + P1
    //             /\                  /\                /\       /\
    //             ||                  ||                ||       ||
    //             c3                  c2                c1       c0

    // Calculate the coefficients
    var a = coordMultiply(p1, -1);
    var b = coordMultiply(p2, 3);
    var c = coordMultiply(p3, -3);
    var c3 = coordAdd(a, coordAdd(b, coordAdd(c, p4)));

    a = coordMultiply(p1, 3);
    b = coordMultiply(p2, -6);
    c = coordMultiply(p3, 3);
    var c2 = coordAdd(a, coordAdd(b, c));

    a = coordMultiply(p1, -3);
    b = coordMultiply(p2, 3);
    var c1 = coordAdd(a, b);

    var c0 = p1;

    // Convert line to normal form: ax + by + c = 0
    // Find normal to line: negative inverse of original line's slope
    var n = [y(a1) - y(a2), x(a2) - x(a1)];

    // Determine new c coefficient
    var cl = x(a1) * y(a2) - x(a2) * y(a1);

    // ?Rotate each cubic coefficient using line for new coordinate system?
    // Find roots of rotated cubic
    var roots = cubeRoots(
        coordDot(n, c3),
        coordDot(n, c2),
        coordDot(n, c1),
        coordDot(n, c0) + cl
    );

    // Any roots in closed interval [0,1] are intersections on Bezier, but
    // might not be on the line segment.
    // Find intersections and calculate point coordinates
    for (var i = 0; i < roots.length; i++) {
        var t = roots[i];

        if (t >= 0 && t <= 1) {
            // We're within the Bezier curve
            // Find point on Bezier
            var p5 = coordLerp(p1, p2, t);
            var p6 = coordLerp(p2, p3, t);
            var p7 = coordLerp(p3, p4, t);

            var p8 = coordLerp(p5, p6, t);
            var p9 = coordLerp(p6, p7, t);

            var p10 = coordLerp(p8, p9, t);

            // See if point is on line segment
            // Had to make special cases for vertical and horizontal lines due
            // to slight errors in calculation of p10
            if (x(a1) === x(a2)) {
                if (y(min) <= y(p10) && y(p10) <= y(max)) {
                    result.push(p10);
                }
            } else if (y(a1) === y(a2)) {
                if (x(min) <= x(p10) && x(p10) <= x(max)) {
                    result.push(p10);
                }
            } else if (x(min) <= x(p10) && x(p10) <= x(max) && y(min) <= y(p10) && y(p10) <= y(max)) {
                result.push(p10);
            }
        }
    }

    return result;
}

function intersectLineLine(a1, a2, b1, b2) {
    var ua_t = (x(b2) - x(b1)) * (y(a1) - y(b1)) - (y(b2) - y(b1)) * (x(a1) - x(b1));
    var ub_t = (x(a2) - x(a1)) * (y(a1) - y(b1)) - (y(a2) - y(a1)) * (x(a1) - x(b1));
    var u_b  = (y(b2) - y(b1)) * (x(a2) - x(a1)) - (x(b2) - x(b1)) * (y(a2) - y(a1));

    if (u_b !== 0) {
        var ua = ua_t / u_b;
        var ub = ub_t / u_b;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return [
                [
                    x(a1) + ua * (x(a2) - x(a1)),
                    y(a1) + ua * (y(a2) - y(a1)),
                ]
            ];
        }
    }

    return [];
}

function getIntersections(zero, point, shape) {
    var coords = shape.coords;
    switch (shape.type) {
    case bezier3Type:
        return intersectBezier3Line(coords[0], coords[1], coords[2], coords[3], zero, point);
    case lineType:
        return intersectLineLine(coords[0], coords[1], zero, point);
    default:
        throw new Error("Unsupported shape type: " + shape.type);
    } // jscs:ignore validateIndentation
    // ^ (jscs bug)
}

function isInside(point, polygon) {
    var segments;
    if (polygon && Array.isArray(polygon)) {
        segments = polygon;
    } else {
        segments = splitSegments(polygon);
    }

    var minX = 0;
    var minY = 0;
    for (var s = 0; s < segments.length; s++) {
        var coords = segments[s].coords;
        for (var c = 0; c < coords.length; c++) {
            var coord = coords[c];
            minX = Math.min(minX, x(coord));
            minY = Math.min(minY, y(coord));
        }
    }
    var zero = [minX - 10, minY - 10];

    var intersections = [];
    for (var i = 0; i < segments.length; i++) {
        var newIntersections = getIntersections(zero, point, segments[i]);
        for (var j = 0; j < newIntersections.length; j++) {
            var seen = false;
            var intersection = newIntersections[j];

            for (var k = 0; k < intersections.length; k++) {
                if (coordEqual(intersections[k], intersection)) {
                    seen = true;
                    break;
                }
            }

            if (!seen) {
                intersections.push(intersection);
            }
        }
    }

    return intersections.length % 2 === 1;
}

module.exports = {
    isInside: isInside,
    segments: splitSegments,
};
