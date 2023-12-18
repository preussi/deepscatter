import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// TypeScript type for the expected data prop structure
type GraphData = {
  nodes: { id: string; x: number; y: number; }[];
};

// Component accepts a data prop of type GraphData
const Graph: React.FC<{ data: GraphData }> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null); // Ref type is SVG element

  useEffect(() => {
  // First check if 'data' exists and then check if 'data.nodes' is an array
  // This ensures that we do not try to access a property on 'null'
  if (svgRef.current && data && Array.isArray(data.nodes)) {
      const svg = d3.select(svgRef.current);
      const svgWidth = +svg.attr('width');
      const svgHeight = +svg.attr('height');
      const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('visibility', 'hidden')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid black')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('text-align', 'center')
      .style('pointer-events', 'none'); // Ensure mouse events pass through
  

        // Remove any existing content in the SVG before adding new elements
      svg.selectAll('*').remove();

      const container = svg.append('g')
      .attr('class', 'zoom-container');

      // Create nodes as 'circle' elements
      container.selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', 1)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', 'black')
        .on('mouseenter', (event, d) => {
          tooltip.text(`Node ID: ${d.id}`);
          tooltip.text(`Song Name: ${d.name}`); // Displaying id, customize what you want to show
          tooltip.style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseleave', () => {
          tooltip.style('visibility', 'hidden');
        });
      
      const xExtent = d3.extent(data.nodes, d => d.x);
      const yExtent = d3.extent(data.nodes, d => d.y);
      const xCenter = (xExtent[0]! + xExtent[1]!) / 2;
      const yCenter = (yExtent[0]! + yExtent[1]!) / 2;

      const initialTransform = d3.zoomIdentity
        .translate(svgWidth / 2 - xCenter, svgHeight / 2 - yCenter);

      /// Apply the initial transformation to center the nodes
      container.attr('transform', initialTransform);

      // Define the zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 10])
        .on('zoom', (event) => {
          // Apply the current zoom transform to the container group
          container.attr('transform', event.transform);
        });

      // Apply the zoom behavior to the SVG element
      svg.call(zoom).call(zoom.transform, initialTransform);

        
    } else {
      console.error('Invalid data or data structure:', data);
    }
  }, [data]); // Only re-run the effect if 'data' changes

  // Set some default width and height attributes for the SVG.
  // Without these, the SVG might not appear at all.
  return (
    <svg ref={svgRef} width='100%' height='100%' />
  );
};

export default Graph;