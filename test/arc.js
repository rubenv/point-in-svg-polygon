var assert = require("assert");
var fs = require("fs");
var cheerio = require("cheerio");
var pointInSvgPolygon = require("..");

var xml = fs.readFileSync(__dirname + "/arc.svg");
var $ = cheerio.load(xml.toString());

describe("Arcs", function () {
    var polygon = $("path#arc").attr("d");

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

    it("Has segments", function () {
        var segments = pointInSvgPolygon.segments(polygon);
        assert.equal(segments.length, 6);
        assertSegment(segments[0], "line", [
            [81, 93],
            [81, 392],
        ]);
        assertSegment(segments[1], "bezier3", [
            [81, 392],
            [119.4373, 391.9747],
            [152.1374, 363.9752],
            [81 + 77.08, 392 - 66],
        ]);
        assertSegment(segments[2], "line", [
            [81 + 77.08, 392 - 66],
            [567.92, 392 - 66],
        ]);
    });
});
