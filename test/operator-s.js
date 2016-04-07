var assert = require("assert");
var fs = require("fs");
var cheerio = require("cheerio");
var pointInSvgPolygon = require("..");

var xml = fs.readFileSync(__dirname + "/operator-s.svg");
var $ = cheerio.load(xml.toString());

describe("Operator s", function () {
    var polygon = $("path#poly").attr("d");
    var segments = pointInSvgPolygon.segments(polygon);

    function assertSegment(segment, type, coords) {
        assert.equal(segment.type, type);
        assert.equal(segment.coords.length, coords.length);
        for (var i = 0; i < coords.length; i++) {
            var c = segment.coords[i];
            var ce = coords[i];
            assert.equal(Math.abs(c[0] - ce[0]) < 1e-4, true);
            assert.equal(Math.abs(c[1] - ce[1]) < 1e-4, true);
        }
    }

    it("Segments", function () {
        assertSegment(segments[0], "bezier3", [
            [550.701, 629.35],
            [550.701, 629.35],
            [550.351, 646.805],
            [550.701, 647.155],
        ]);
    });

    function getPoint(id) {
        var point = $("circle#" + id);
        var x = point.attr("cx");
        var y = point.attr("cy");
        return [x, y];
    }

    it("s1: inside", function () {
        assert.equal(pointInSvgPolygon.isInside(getPoint("s1"), segments), true);
    });

    it("s2: outside", function () {
        assert.equal(pointInSvgPolygon.isInside(getPoint("s2"), segments), false);
    });

    it("s3: inside", function () {
        assert.equal(pointInSvgPolygon.isInside(getPoint("s3"), segments), true);
    });

    it("s4: outside", function () {
        assert.equal(pointInSvgPolygon.isInside(getPoint("s4"), segments), false);
    });

    it("s5: outside", function () {
        assert.equal(pointInSvgPolygon.isInside(getPoint("s5"), segments), false);
    });
});
