require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"point-in-svg-polygon":[function(require,module,exports){
var bezier3Type = "bezier3";
var lineType = "line";

var mathAbs = Math.abs;
var mathMax = Math.max;
var mathMin = Math.min;
var mathPow = Math.pow;
var mathSqrt = Math.sqrt;

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
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
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
    var origin = [0, 0];

    function stripWhitespace() {
        while (polygon[0] === " " || polygon[0] === "\n") {
            polygon = polygon.substring(1);
        }
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
                var expEnd = readCharSeq(1);
                var exp = toFloat(polygon.substring(1, expEnd));
                if (exp > 0) {
                    num *= mathPow(10, exp);
                }
                polygon = polygon.substring(expEnd);
            }
            return num;
        }
    }

    function readCoords(n, fn) {
        stripWhitespace();
        var index = 0;
        var c = polygon.charCodeAt(0);
        while ((c >= 48 && c <= 57) || c === 44 || c === 45) {
            var coords = [];
            for (var i = 0; i < n; i++) {
                coords.push([readNumber(), readNumber()]);
            }
            fn(coords, index);

            stripWhitespace();
            c = polygon.charCodeAt(0);
            index++;
        }
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

    function readSegment() {
        stripWhitespace();
        if (polygon === "") {
            return;
        }

        var operator = polygon[0];
        polygon = polygon.substring(1);

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
                        position = [x(c) + x(position), y(c) + y(position)];
                    }

                    if (!start) {
                        start = position;
                    }
                } else {
                    var c0 = c[0];
                    pushType(lineType)([[x(c0) + x(position), y(c0) + y(position)]]);
                }
            });
            break;
        case "C":
            readCoords(3, pushType(bezier3Type));
            break;
        case "c":
            readCoords(3, pushType(bezier3Type, origin));
            break;
        case "S":
            readCoords(2, function (coords) {
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

                coords.unshift(controlPoint);
                pushType(bezier3Type)(coords);
            });
            break;
        case "L":
            readCoords(1, pushType(lineType));
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
        }
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
    }
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

},{}]},{},["point-in-svg-polygon"]);
