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
        assert.equal(pointInSvgPolygon.isInside([429, 79], result), true);
    });

    it("Handles operator omission", function () {
        var result = pointInSvgPolygon.segments("M 100 200 L 200 100 -100 -200");
        assert.equal(result.length, 2);
    });

    it("Handles initial relative moveTo", function () {
        var result = pointInSvgPolygon.segments("m 85,109 c 0,2.76142 -2.238576,5 -5,5 -2.761424,0 -5,-2.23858 -5,-5 0,-2.76142 2.238576,-5 5,-5 2.761424,0 5,2.23858 5,5 z");
        assert.equal(result.length, 4); //only 4 segments because the z operator does nothing
        assert.equal(pointInSvgPolygon.isInside([77, 109], result), true);
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

    it("Handles exponents", function () {
        var result = pointInSvgPolygon.segments("M 1,1e3 2,3");
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].coords[0], [1, 1000]);
        assert.deepEqual(result[0].coords[1], [2, 3]);
    });

    it("Handles zero-length lines", function () {
        var result = pointInSvgPolygon.segments("M0,0 L155,0 L152.261719,62 L2.796875,62 L0,0 L0,0 Z");
        assert.equal(result.length, 4);
    });

    it("Handles l-operator", function () {
        var result = pointInSvgPolygon.segments("M1060.6,63.7l-21.8,79.5");
        assert.equal(result.length, 1);
        assert.equal(result[0].coords[0][0], 1060.6);
        assert.equal(result[0].coords[0][1], 63.7);
        assert.equal(result[0].coords[1][0], 1060.6 - 21.8);
        assert.equal(result[0].coords[1][1], 63.7 + 79.5);
    });

    it("Handles s-operator", function () {
        var result = pointInSvgPolygon.segments("M10,10 s10,10 15,15 s10,10 15,5");
        assert.equal(result.length, 2);
        assert.equal(pointInSvgPolygon.isInside([29, 29], result), true);
        assert.equal(pointInSvgPolygon.isInside([29, 28.8], result), false);
    });

    it("Handles Q-operator", function () {
        var result = pointInSvgPolygon.segments("M50,75 Q234,54 56567,565");
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].coords[0], [50, 75]);
        assert.deepEqual(result[0].coords[1], [172.66666666666666, 61]);
        assert.deepEqual(result[0].coords[2], [19011.66666666667, 224.33333333333337]);
        assert.deepEqual(result[0].coords[3], [56567, 565]);
    });

    it("Handles q-operator", function () {
        var result = pointInSvgPolygon.segments("M50,75 q10,-10 54,763");
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].coords[0], [50, 75]);
        assert.deepEqual(result[0].coords[1], [56.666666666666664, 68.33333333333333]);
        assert.deepEqual(result[0].coords[2], [74.66666666666667, 322.66666666666674]);
        assert.deepEqual(result[0].coords[3], [104, 838]);
        assert.equal(pointInSvgPolygon.isInside([50, 75], result), true);
        assert.equal(pointInSvgPolygon.isInside([49.99, 75], result), false);
    });

    it("Handles very compact long beziers", function () {
        var svgtext = "<svg><path d='M64.2 155c-14 13.4-1.2 10.7 3.8 10 14.9-2 17.8-5 19.7-7.3 7-8.3 3.7-15-7.2-13.5-5.5.7-10.3 5-16.3 10.7z' /><path d='M68 112.2c-8.5-7.4-7.5-12 1.3-11.3 7.7.6 16.2 2.6 19.1 7.5 4.2 7 7.2 17-7.5 13.3-4.5-1-7.7-5-12.8-9.5z'/><path d='M57.4 57c-13.7 2-.4 9.3 2 8.8s8.8-3.5 26.3-9.1c2.4-.7 4.2-.1 5.3 1.7 1.5 2.2 2.2 6.9 2.2 14.1 1.2 57.6 1 103.8-.7 138.6 0 5.4-.7 9.3-2 11.6-.7 1.1-2.3 1.2-5 .2a71 71 0 0 1-10-2.7c-2.7-1.1-4-.8-3.7 1 7.3 9.6 16.5 17.7 20.5 24.5 1.9 3.6 3.8 6 6 7 1.1.6 2.3 0 3.6-1.8 5.4-10.9 9.8-19.4 9.7-29-1.3-33.7-2-78.2-2.2-133.3-.1-11.5.7-19.8 2.6-25 1.7-4 1.7-6.9 0-8.9a54.8 54.8 0 0 0-13.7-11.6c-2.5-1.7-4.7-1.8-6.6-.5a70.8 70.8 0 0 1-34.3 14.3z'/><path d='M60.8 144.5c1.5-20 2-49.5 2-52.3.6-17.2.6-25.6 1-29.7.5-4.7-1.9-8.7-2-8.8A16.8 16.8 0 0 0 45.2 49c-2.5.6-2.8 3-.7 7 4.4 11 5.4 37.2 3 78.5-.7 16.9-4.1 35.2-10.1 55A144.8 144.8 0 0 1 13.9 239c-1.8 2.5-3 4.3-3.4 5.4-.1 1.5.5 2.1 2 2 6-.7 14-9.2 24.3-25.6a179.9 179.9 0 0 0 24-76.3z'/></svg>";
        var re = /path d='(.*?)'/g;
        var raw_paths = [];
        var matches;
        while ((matches = re.exec(svgtext)) !== null) {
            raw_paths.push(matches[1]);
        }
        var segs = raw_paths.map(x => pointInSvgPolygon.segments(x));
        assert.deepEqual(segs.map(s => s.length), [5, 5, 20, 12]);
        assert.equal(segs.some(function (seg) { return pointInSvgPolygon.isInside([93,  42], seg); }), true);
        assert.equal(segs.some(function (seg) { return pointInSvgPolygon.isInside([92,  42], seg); }), false);
        assert.equal(segs.some(function (seg) { return pointInSvgPolygon.isInside([99.99, 251.99], seg); }), true);
        assert.equal(segs.some(function (seg) { return pointInSvgPolygon.isInside([100, 253], seg); }), false);
        assert.equal(segs.some(function (seg) { return pointInSvgPolygon.isInside([198, 282], seg); }), false);
        assert.equal(segs.some(function (seg) { return pointInSvgPolygon.isInside([0, 0], seg); }), false);
    });

    it("should support a relative move to after a first move to", function () {
        var result = pointInSvgPolygon.segments("M270,38 m17,25 L10 12");
        assert.equal(result.length, 1);
        assert.deepEqual(result[0].coords[0], [287, 63]);
        assert.deepEqual(result[0].coords[1], [10, 12]);
    });
});
