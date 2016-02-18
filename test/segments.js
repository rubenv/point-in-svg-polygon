var assert = require("assert");
var pointInSvgPolygon = require("..");

describe("Segments", function () {
    it("Splits segments correctly", function () {
        var result = pointInSvgPolygon.segments("M1,1 L2000,1 L2000,2000 L1,2000 Z");
        assert.equal(result.length, 4);
    });
});
