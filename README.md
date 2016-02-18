# point-in-svg-polygon - Determine if an point is inside a polygon

[![Build Status](https://travis-ci.org/rubenv/point-in-svg-polygon.png?branch=master)](https://travis-ci.org/rubenv/point-in-svg-polygon)

Works with arbitrary polygons (as in: curves!).

## What it does

Given an SVG path and a point, it'll tell you whether the point lies within the SVG path.

For instance:

<svg width="501px" height="501px" viewBox="0 0 1002 1002" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M1,410.783346 C1,410.783346 367.927991,-268.832584 690.790889,122.379343 C1013.65379,513.591271 1181.86718,1000.99997 701.429412,1001 C220.991638,1001.00003 1,410.783346 1,410.783346 Z" id="convex" stroke="red"></path>
        <path d="M534.014412,494.680881 C326.331277,308.203524 1,363.849357 1,363.849357 C1,363.849357 372.038777,368.406101 575.846365,249.559994 C709.326852,171.723656 647.149274,-114.620488 794.047554,52.5114874 C880.564235,150.944932 575.763914,321.305039 635.771341,423.044204 C725.233931,574.722915 865.834593,300.542794 942.264223,400.520234 C1034.51979,521.199548 1037.9573,1000.99998 806.278585,1001 C598.123901,1001.00001 659.610219,607.452552 534.014412,494.680881 Z" id="concave" stroke="blue"></path>
    </g>
    <g stroke="none" fill="red">
        <circle cx="50"  cy="50"  r="6" id="point1" />
        <circle cx="68"  cy="360" r="6" id="point2" fill="green" />
        <circle cx="429" cy="360" r="6" id="point3" fill="green" />
        <circle cx="858" cy="239" r="6" id="point4" />
        <circle cx="735" cy="385" r="6" id="point5" fill="blue" />
        <circle cx="990" cy="990" r="6" id="point6" />
        <circle cx="749" cy="91"  r="6" id="point6" fill="orange" />
    </g>
</svg>

Color  | Inside red shape (convex)? | Inside blue shape (concave)?
------ | -------------------------- | ----------------------------
Red    | No                         | No
Green  | Yes                        | Yes
Blue   | Yes                        | No
Orange | No                         | Yes

## Usage

Give it a point and a path string:

```js
var pointInSvgPolygon = require("point-in-svg-polygon");

// See the path specification for the correct format
// https://developer.mozilla.org/en/docs/Web/SVG/Tutorial/Paths
var pathString = "M1,1 C1,1 501,1 501,501 C501,1001 1,1001 1,1001 L1,1 Z";
var result = pointInSvgPolygon.isInside([x, y], pathString);
```

You can amortize the path splitting by performing it once:

```js
var pointInSvgPolygon = require("point-in-svg-polygon");

// See the path specification for the correct format
// https://developer.mozilla.org/en/docs/Web/SVG/Tutorial/Paths
var pathString = "M1,1 C1,1 501,1 501,501 C501,1001 1,1001 1,1001 L1,1 Z";
var segments = pointInSvgPolygon.segments(pathString);

// Use it multiple times:
var result = pointInSvgPolygon.isInside([x, y], segments);
```

This is useful if you have to test a lot of points.

## Credits

Originally based on the work by Kevin Lindsey. Severly trimmed down.

## License 

    Copyright (c) 2016, Ruben Vermeersch
    Copyright (c) 2013, Kevin Lindsey
    All rights reserved.

    Redistribution and use in source and binary forms, with or without modification,
    are permitted provided that the following conditions are met:

      Redistributions of source code must retain the above copyright notice, this
      list of conditions and the following disclaimer.

      Redistributions in binary form must reproduce the above copyright notice, this
      list of conditions and the following disclaimer in the documentation and/or
      other materials provided with the distribution.

      Neither the name of the {organization} nor the names of its
      contributors may be used to endorse or promote products derived from
      this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
    ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
