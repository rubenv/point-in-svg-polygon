var assert = require("assert");
var fs = require("fs");
var cheerio = require("cheerio");
var pointInSvgPolygon = require("..");

var colors = {
    red: {
        concave: false,
        convex:  false,
    },
    green: {
        concave: true,
        convex:  true,
    },
    blue: {
        concave: false,
        convex:  true,
    },
    orange: {
        concave: true,
        convex:  false,
    },
};

var segments = {
    concave: 7,
    convex:  3,
};

var shapes = ["concave", "convex"];
var points = 6;

var xml = fs.readFileSync(__dirname + "/intersections.svg");
var $ = cheerio.load(xml.toString());

function testPoint(shape, polygon, point) {
    return function () {
        var p = $("circle#point" + (point + 1));
        var x = parseFloat(p.attr("cx"), 10);
        var y = parseFloat(p.attr("cy"), 10);
        var color = p.attr("fill") || "red";
        var result = pointInSvgPolygon.isInside([x, y], polygon);
        assert.equal(result, colors[color][shape]);
    };
}

function testShape(shape) {
    var polygon = $("path#" + shape).attr("d");

    return function () {
        it("Segments", function () {
            var result = pointInSvgPolygon.segments(polygon);
            assert.equal(result.length, segments[shape]);
        });

        for (var j = 0; j < points; j++) {
            it("Point " + (j + 1), testPoint(shape, polygon, j));
        }
    };
}

describe("Point in SVG Polygon", function () {
    it("Exposes functions", function () {
        assert.equal(typeof pointInSvgPolygon, "object");
        assert.equal(typeof pointInSvgPolygon.isInside, "function");
    });

    for (var i = 0; i < shapes.length; i++) {
        describe("Shape: " + shapes[i], testShape(shapes[i]));
    }

    it("Correctly intersects at zero", function () {
        var result = pointInSvgPolygon.isInside([10, 10], "M0,0 L155,0 L152.261719,62 L2.796875,62 L0,0 Z");
        assert.equal(result, true);
    });
});
