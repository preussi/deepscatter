'use client'

import React, { useState, useEffect } from 'react';
import Graph from './Graph';

export default function Home() {
  const [query, setQuery] = useState('');
  const [urls, setUrls] = useState([]);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // Define the function to fetch graph data
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://ee-tik-vm054.ethz.ch:8000/graph-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GraphData = await response.json();
        setGraphData(data); // Set the graph data in state
      } catch (error) {
        console.error("Could not fetch graph data:", error);
      }
    };

    fetchGraphData(); // Call the function to fetch graph data
  }, []);

  const handleSearchKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const result = await fetch(`http://ee-tik-vm054.ethz.ch:8000/search?query=${query}`);
        const data = await result.json();
        setUrls(data);
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };

  return (
    <main className='flex min-h-screen flex-row items-start p-12'>
      <div className='flex-grow'> {/* Graph container */}
        <div style={{}}>
          <input
            style={{ border: '2px solid black', borderRadius: 15, padding: 5, marginBottom: 10, alignContent: 'center'}}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search...'
            value={query}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        {graphData && <div style={{ height: '100%' }}><Graph data={graphData} /></div>}
      </div>

      <div className='w-1/3'> {/* Previews container */}
        {urls.map((urlPair, index) => (
          <div key={index} className="video-container">
            <iframe
              title={`Embedded Video ${index}`}
              src={`https://www.youtube.com/embed/${new URL(urlPair[0]).searchParams.get('v')}`}
              className="video-iframe"
            />
            <audio
              title={`Audio Preview ${index}`}
              src={urlPair[1]}
              controls
              className="audio-preview"
            />
          </div>
        ))}
      </div>
    </main>
  );
}

