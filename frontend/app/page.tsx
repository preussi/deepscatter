'use client'

import React, { useState, useEffect } from 'react';
import Graph from './Graph_old';

export default function Home() {
  const [query, setQuery] = useState(''); // State for the first input
  const [id, setid] = useState(''); // State for the second input
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

  const retrieve = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const result = await fetch(`http://ee-tik-vm054.ethz.ch:8000/retrieve?id=${id}`);
        const data = await result.json();
        setUrls(data);
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', paddingTop: 10 }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <input
          style={{ border: '2px solid black', borderRadius: '15px', padding: '5px', textAlign: 'center' }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search...'
          value={query}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <input
          style={{ border: '2px solid black', borderRadius: '15px', padding: '5px', textAlign: 'center' }}
          onChange={(e) => setid(e.target.value)}
          placeholder='ID Search...'
          value={id}
          onKeyDown={retrieve}
        />
      </div>
      <div style={{ display: 'flex', width: '100%', flexGrow: 1 }}>
        <div style={{ flex: 2.5, paddingRight: '0px', overflow: 'auto' }}>
          <iframe src="http://ee-tik-vm054.ethz.ch:3344" style={{ width: '100%', height: '100%' }}></iframe>
        </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', padding: '2px' }}>
          {urls.map((urlPair, index) => (
            <div key={index} style={{ maxHeight: '200px', overflow: 'auto' }}> {/* Limiting height and making it scrollable */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  title={`Embedded Video ${index}`}
                  src={`https://www.youtube.com/embed/${new URL(urlPair[0]).searchParams.get('v')}`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
              <audio
                title={`Audio Preview ${index}`}
                src={urlPair[1]}
                controls
                style={{ width: '100%', marginTop: '0px' }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
