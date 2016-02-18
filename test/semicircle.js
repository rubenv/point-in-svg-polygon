var assert = require("assert");
var fs = require("fs");
var cheerio = require("cheerio");
var pointInSvgPolygon = require("..");

var xml = fs.readFileSync(__dirname + "/semicircle.svg");
var $ = cheerio.load(xml.toString());

describe("Semi-circle", function () {
    var polygon = $("path#semicircle").attr("d");

    it("Has segments", function () {
        var result = pointInSvgPolygon.segments(polygon);
        assert.equal(result.length, 3);
    });

    function testPoint(point, inside) {
        it("Point " + JSON.stringify(point) + " is " + (inside ? "" : "not ") + "inside", function () {
            assert.equal(pointInSvgPolygon.isInside(point, polygon), inside);
        });
    }

    testPoint([0, 0], false);
    testPoint([0, 500], false);
    testPoint([0, 1000], false);

    testPoint([100, 100], true);
    testPoint([500, 500], true);

    testPoint([1000, 0], false);
    testPoint([1000, 500], false);
    testPoint([1000, 1000], false);
});
