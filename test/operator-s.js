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
            assert.equal(Math.abs(c[0] - ce[0]) < 1e-4, true, c + " equals " + ce);
            assert.equal(Math.abs(c[1] - ce[1]) < 1e-4, true, c + " equals " + ce);
        }
    }

    it("Segments", function () {
        assert.equal(segments.length, 15);
        assertSegment(segments[0], "bezier3", [
            [550.701, 629.35],
            [550.701, 629.35],
            [550.351, 646.805],
            [550.701, 647.155],
        ]);
        assertSegment(segments[1], "bezier3", [
            [550.701, 647.155],
            [551.051, 647.505],
            [564.790, 647.155],
            [564.790, 647.155],
        ]);
        assertSegment(segments[2], "line", [
            [564.790, 647.155],
            [564.790, 663.637],
        ]);
        assertSegment(segments[3], "line", [
            [564.790, 663.637],
            [581.963, 663.637],
        ]);
        assertSegment(segments[4], "line", [
            [581.963, 663.637],
            [581.963, 680.194],
        ]);
        assertSegment(segments[5], "line", [
            [581.963, 680.194],
            [601.307, 680.194],
        ]);
        assertSegment(segments[6], "line", [
            [601.307, 680.194],
            [601.307, 692.233],
        ]);
        assertSegment(segments[7], "line", [
            [601.307, 692.233],
            [637.778, 692.233],
        ]);
        assertSegment(segments[8], "line", [
            [637.778, 692.233],
            [637.778, 710.113],
        ]);
        assertSegment(segments[9], "bezier3", [
            [637.778, 710.113],
            [637.778, 710.113],
            [513.749, 733.793],
            [360.762, 681.453],
        ]);
        assertSegment(segments[10], "line", [
            [360.762, 681.453],
            [428.700, 619.434],
        ]);
        assertSegment(segments[11], "line", [
            [428.700, 619.434],
            [435.811, 611.763],
        ]);
        assertSegment(segments[12], "line", [
            [435.811, 611.763],
            [545.499, 603.973],
        ]);
        assertSegment(segments[13], "line", [
            [545.499, 603.973],
            [550.502, 606.073],
        ]);
        assertSegment(segments[14], "line", [
            [550.502, 606.073],
            [550.701, 629.350],
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
