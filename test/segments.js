var assert = require("assert");
var pointInSvgPolygon = require("..");

describe("Segments", function () {
    it("Splits segments correctly", function () {
        var result = pointInSvgPolygon.segments("M1,1 L2000,1 L2000,2000 L1,2000 Z");
        assert.equal(result.length, 4);
    });

    it("Supports Illustrator craziness", function () {
        var result = pointInSvgPolygon.segments("M867,605H211V200h656V605z");
        assert.equal(result.length, 4);
    });

    it("Supports more Illustrator craziness", function () {
        var result = pointInSvgPolygon.segments("M963,354c0,125.9-173,273-388.5,228C364.5,538.1,186,479.9,186,354S546.8-86.8,574.5,126C596,291,963,228.1,963,354z");
        assert.equal(result.length, 4);
    });

    it("Handles operator omission", function () {
        var result = pointInSvgPolygon.segments("M 100 200 L 200 100 -100 -200");
        assert.equal(result.length, 2);
    });

    it("Handles initial relative moveTo", function () {
        var result = pointInSvgPolygon.segments("m 85,109 c 0,2.76142 -2.238576,5 -5,5 -2.761424,0 -5,-2.23858 -5,-5 0,-2.76142 2.238576,-5 5,-5 2.761424,0 5,2.23858 5,5 z");
        assert.equal(result.length, 5);
    });

    it("Handles implicite moveTo", function () {
        var result = pointInSvgPolygon.segments("m 212.5413,-8.3834813 52.39298,0 -1.02003,251.8031013 -49.92232,0 -1.45063,-251.8031013 z");
        assert.equal(result.length, 5);
    });
});
