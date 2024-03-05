'use client'
import React, { useState, useEffect } from 'react';
import SongTile from './SongTile';

const generateYouTubeUrl = (urlPair) => {
  let videoId = new URL(urlPair['0']).searchParams.get('v');
  return `https://www.youtube.com/embed/${videoId}`;
};

function getYouTubeThumbnail(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoID = match[2];
    return `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`;
  } else {
    // Handle the case where the URL does not contain a valid video ID
    return null;
  }
}

const generateSpotifyUrl = (urlPair) => {
  let spotifyUrl = urlPair['1'];
  return spotifyUrl;
};

const generateMetadataContent = () => {
  if (urls.length > 0) {
    const mainResult = urls[0];
    const trackTitle = mainResult[3]; // Assuming this index stores the track title
    const artistName = mainResult[2]; // Assuming this index stores the artist name
    return `Track: ${trackTitle}, Artist: ${artistName}`;
  }
  return "No results to display."; // Fallback text
};

export default function Home() {

  const [searchInitiated, setSearchInitiated] = useState(false);
  const [query, setQuery] = useState(''); // State for the first input
  const [urls, setUrls] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  // Function to toggle visibility of upload button
  const toggleUploadVisibility = () => setShowUpload(!showUpload);

  const sampleQueries = ["Jazzy Ballades", "2000s european electro", "best song ever", "Top Hits"];

  // Function to simulate typing effect
  const typeEffect = (text, idx = 0) => {
    if (idx < text.length) {
      setQuery(text.substring(0, idx + 1));
      setTimeout(() => typeEffect(text, idx + 1), 200); // Adjust timing as needed
    }
  };

  // UseEffect to start typing effect on component mount
  useEffect(() => {
    // Randomly select one of the queries
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    typeEffect(randomQuery);
  }, []);

  const generateMetadataContent = () => {
    if (urls.length > 0) {
      const mainResult = urls[0];
      const trackTitle = mainResult[3]; // Assuming this index stores the track title
      const artistName = mainResult[2]; // Assuming this index stores the artist name
      return `Track: ${trackTitle}\n Artist: ${artistName}`;
    }
    return "No results to display."; // Fallback text
  };

  // Styles for hidden and visible states of the upload button
  const uploadButtonStyle = {
    display: showUpload ? 'block' : 'none', // Show or hide based on state
    cursor: 'pointer',
    marginLeft: '10px',
    color: 'white',
    // Add other styles as needed
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true); // Start loading
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const response = await fetch('http://ee-tik-vm054.ethz.ch:8000/upload-audio/', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const result = await response.json();
        setUrls(result); // Assuming `result` is in the correct format for your tiles
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };
  
  const resultsRef = React.useRef(null);

  // Function to handle clicks outside of the results container
  const handleClickOutside = (event) => {
    if (resultsRef.current && !resultsRef.current.contains(event.target)) {
      setSearchInitiated(false); // Hide the results
    }
  };

  // Add event listener when component mounts and remove it when it unmounts
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchKeyDown = async (event) => {
    if (event.key === 'Enter') {
      try {
        const result = await fetch(`http://ee-tik-vm054.ethz.ch:8000/search?query=${query}`);
        const data = await result.json();
        console.log("Search results:", data); // Debug log
        setSearchInitiated(true); // Set this to true when search is performed
        setUrls(data);
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };

  const retrieve = async (id) => {
    try {
      const result = await fetch(`http://ee-tik-vm054.ethz.ch:8000/retrieve?id=${id}`);
      const data = await result.json();
      console.log("Search results:", data); // Debug log
      setSearchInitiated(true); // Set this to true when search is performed
      setUrls(data);
    } catch (error) {
      console.error("Could not fetch search results:", error);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
        // Ensure the message is from your D3 visualization
        // Replace `d3AppOrigin` with the origin of your D3 visualization
        if (event.origin === 'http://ee-tik-vm054.ethz.ch:3344') {
            if (event.data.type && event.data.type === 'nodeClicked') {
                retrieve(event.data.id);
                console.log('Node clicked with ID:', event.data.id);
                // You can now use this ID as needed, such as fetching more data
            }
        }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => window.removeEventListener('message', handleMessage);
}, []);

  const searchBarStyle = {
    padding: '10px 15px',
    fontSize: '20px',
    outline: 'none',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    borderRadius: '20px',
    boxSizing: 'border-box'
  };

  const searchContainerStyle = {
    width: '50%', // Full width to contain the search bar
    height: '50px', // Fixed height, adjust as needed
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 2,
    cursor: 'pointer', // Change cursor to indicate it's interactive
  };

  const searchResultsContainerStyle = {
    display: 'flex', 
    flexDirection: 'column',
    width: '40%', // Adjust the width as needed
    zIndex: 2,
    marginTop: '10px', // Adjust based on the height of your search container
    overflowY: 'auto', // Enable scrolling for overflow
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Opaque black background, adjust opacity as needed
    padding: '10px', // Add some padding
    borderRadius: '10px', // Optional, for rounded corners
  };

  const mainResultStyle = {
    width: '100%', // Taking full width of the container
    height: '30vh', // Using 50% of the viewport height to make it take more vertical space
    border: 'none',
    borderRadius: '10px',
  };

  // Adjusted style for the container of additional results
  const additionalResultsStyle = {
    overflowY: 'auto', 
    padding: '10px',
  };

  // Style for the additional metadata container
  const metadataContainerStyle = {
    height: '10vh', // Adjust the height as needed
    padding: '10px', // Add padding as needed
    color: 'white', // Text color
    // Add other styles as needed
  };

  const hiddenSearchBarStyle = {
    ...searchBarStyle, // Spread the existing search bar styles
    opacity: 0, // Make it invisible initially
    visibility: 'hidden', // Hide it initially
    transition: 'opacity 0.5s, visibility 0.5s', // Smooth transition for opacity and visibility
  };


return (
  <main style={{ 
      position: 'relative', 
      padding: 5,
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Align items to the start of the main axis
    }}>
      <iframe 
        src="http://ee-tik-vm054.ethz.ch:3344" 
        style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '100%', border: 'none', zIndex: 0 }}
      ></iframe>
      {/* Search bar and Upload*/}
      <div style={searchContainerStyle}>
        <input
          style={searchBarStyle}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search...'
          value={query}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      {/* Search Results */}
      {searchInitiated && (
          <div style={searchResultsContainerStyle} ref={resultsRef}>
            {/* Main Result Div */}
            {urls.length > 0 && (
              <div>
                <iframe
                  src={generateYouTubeUrl(urls[0])}
                  style={mainResultStyle}
                  title="YouTube Video"
                ></iframe>
              </div>
            )}

            <div style={metadataContainerStyle}>
              {/* Display track and artist name dynamically */}
              <p>{generateMetadataContent()}</p>
            </div>

            {/* Additional Results Div */}
            {urls.length > 1 && (
              <div style={additionalResultsStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {urls.slice(1).map((urlPair, index) => (
                    <SongTile
                      key={urlPair[4]}
                      title={urlPair[3]}
                      artist={urlPair[2]}
                      score={urlPair[5]}
                      spotifyPreviewUrl={generateSpotifyUrl(urlPair)}
                      thumbnailUrl={getYouTubeThumbnail(generateYouTubeUrl(urlPair))}
                      youtubeUrl={generateYouTubeUrl(urlPair)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
  </main>
);
}