import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import * as fc from 'd3fc';

const width = 500, height = 250;
const data = d3.range(0, 50).map(d => Math.random());

const xScale = d3.scaleLinear()
    .domain([0, 50])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

const canvasgl = d3.select('#line-webgl').node();
canvasgl.width = width;
canvasgl.height = height;
const gl = canvasgl.getContext('webgl');

// the webgl series component that renders data, transformed
// using D3 scales, onto a WebGL context
const webglLine = fc.seriesWebglLine()
    .xScale(xScale)
    .yScale(yScale)
    .crossValue((_, i) => i)
    .mainValue(d => d)
    .context(gl);

webglLine(data);
