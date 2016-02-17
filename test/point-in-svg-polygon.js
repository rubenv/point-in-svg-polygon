var assert = require("assert");
var pointInSvgPolygon = require("..");

describe("Point in SVG Polygon", function () {
    it("Exposes functions", function () {
        assert.equal(typeof pointInSvgPolygon, "object");
    });
});
