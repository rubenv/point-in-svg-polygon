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

    it("Handles implicite moveTo (relative)", function () {
        var result = pointInSvgPolygon.segments("m 1,1 2,3 z");
        assert.equal(result.length, 2);
        assert.deepEqual(result[0].coords[0], [1, 1]);
        assert.deepEqual(result[0].coords[1], [3, 4]);
        assert.deepEqual(result[1].coords[0], [3, 4]);
        assert.deepEqual(result[1].coords[1], [1, 1]);
    });

    it("Handles coordinates correctly", function () {
        var result = pointInSvgPolygon.segments("M228.7,465 h253.7 v200.5 h-253.7 Z");
        assert.equal(result.length, 4);
        assert.deepEqual(result[0].coords[0], [228.7, 465]);
        assert.deepEqual(result[0].coords[1], [228.7 + 253.7, 465]);
        assert.deepEqual(result[1].coords[0], [228.7 + 253.7, 465]);
        assert.deepEqual(result[1].coords[1], [228.7 + 253.7, 465 + 200.5]);
        assert.deepEqual(result[2].coords[0], [228.7 + 253.7, 465 + 200.5]);
        assert.deepEqual(result[2].coords[1], [228.7, 465 + 200.5]);
        assert.deepEqual(result[3].coords[0], [228.7, 465 + 200.5]);
        assert.deepEqual(result[3].coords[1], [228.7, 465]);
    });
});
