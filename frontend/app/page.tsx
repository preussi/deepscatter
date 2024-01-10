'use client'

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faUpload } from '@fortawesome/free-solid-svg-icons';

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

const SongTile = ({ title, artist, thumbnailUrl, youtubeUrl, spotifyPreviewUrl }) => {
  const audioRef = useRef(new Audio(spotifyPreviewUrl));
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const playIconStyle = isPlaying ? {} : { transform: 'translateX(2px)' }; // Adjust as needed

  const tileStyle = {
    width: '200px',
    height: '200px',
    backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0)), url(${thumbnailUrl})`,
    backgroundSize: 'cover',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '10px',
    color: 'white',
    borderRadius: '10px',
    margin: '10px',
    position: 'relative', // For absolute positioning of children
  };

  const textStyle = {
    textAlign: 'center', // Center the text
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Text shadow for better readability
    margin: '5px 0', // Margin for spacing
  };

  const playButtonStyle = {
    fontSize: '28px', // Adjust icon size as needed
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    width: '45px', // Fixed width
    height: '45px', // Fixed height to maintain the circle shape
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0, // Remove padding to prevent squeezing
  };

  const linkStyle = {
    color: 'white', // Match the color scheme
    textDecoration: 'none', // Remove underline
    fontSize: '14px', // Adjust font size
  };

  return (
    <div style={tileStyle}>
      <div style={textStyle}>
        <h4>{title}</h4>
        <p>{artist}</p>
      </div>
      <button onClick={togglePlay} style={playButtonStyle}>
        <span style={playIconStyle}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </span>
      </button>
      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
        Watch on YouTube
      </a>
    </div>
  );
};

export default function Home() {

  const [searchInitiated, setSearchInitiated] = useState(false);
  const [isSearchQuery, setIsSearchQuery] = useState(true); // New state to track the type of query
  const [query, setQuery] = useState(''); // State for the first input
  const [id, setid] = useState(''); // State for the second input
  const [urls, setUrls] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
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
      }
    }
  };
  
  

  // Reset function
  const handleReset = () => {
    setUrls([]); // Clear search results
    setSearchInitiated(false); // Reset search initiated state
    setQuery(''); // Clear the search query if needed
  };

  // Styles for the reset button

  const handleSearchKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const result = await fetch(`http://ee-tik-vm054.ethz.ch:8000/search?query=${query}`);
        const data = await result.json();
        setIsSearchQuery(true);
        setSearchInitiated(true);
        setUrls(data);
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };

  {/*const retrieve = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      try {
        const result = await fetch(`http://ee-tik-vm054.ethz.ch:8000/retrieve?id=${id}`);
        const data = await result.json();
        setIsSearchQuery(false);
        setUrls(data);
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };*/}

  const resetButtonStyle = {
    marginLeft: '10px', // Spacing from the search bar
    padding: '5px 10px', // Padding for the button
    cursor: 'pointer', // Cursor style
    // Add more styles as needed...
  };

  const searchBarStyle = {
    padding: '5px 10px',
    fontSize: '25px',
    outline: 'none',
    color: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    borderRadius: '20px',
  };

  const placeholderStyle = `
  ::placeholder {
    color: #600; // Darker color for placeholder
    opacity: 1; // Full opacity for placeholder
    font-weight: bold; // Bold font weight
    text-shadow: 3px 3px 3px #fff; // White text shadow for contrast
  }
`;

  return (
    <main style={{ 
      position: 'relative', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden',
      display: 'flex', // Use flexbox for layout
      flexDirection: 'column', // Stack children vertically
      justifyContent: 'center', // Center horizontally (for the cross-axis of the column direction)
      alignItems: 'center', // Center vertically (for the main axis of the column direction)
    }}>
    
      {/* Full-screen static iframe */}
      <iframe 
        src="http://ee-tik-vm054.ethz.ch:3344" 
        style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '100%', border: 'none', zIndex: 0 }}
      ></iframe>
      {/* Overlay content */}

      {/* Search bar and Upload*/}
      <div style={{
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Align items vertically in the center
        zIndex: 2,
        position: 'relative', // Use relative for positioning context
        width: '100%', // Take the full width to center content
      }}>
        <input
          style={searchBarStyle}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search...'
          value={query}
          onKeyDown={handleSearchKeyDown}
        />
        <label htmlFor="audio-upload" style={{ cursor: 'pointer', marginLeft: '10px' }}>
          <FontAwesomeIcon icon={faUpload} size="2x" />
        </label>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      {/* Scrollable URL boxes */}
      <div 
      style={{ 
        overflowY: 'auto', // Enable vertical scrolling
        maxHeight: '90vh', // Set a maximum height for the scrollable area
        width: '30%', // Maintain the width
        margin: '20px auto 0', // Center the div horizontally and add top margin
        display: 'flex', // Use flexbox for inner item alignment
        flexDirection: 'column', // Stack children vertically
        alignItems: 'center', // Center children horizontally
        zIndex: 2
      }}
    >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {urls.map((urlPair, index) => (
            <SongTile
              key={index}
              title={urlPair[3]} // Replace with your actual data keys
              artist={urlPair[2]} // Replace with your actual data keys
              spotifyPreviewUrl={generateSpotifyUrl(urlPair)}
              thumbnailUrl={getYouTubeThumbnail(generateYouTubeUrl(urlPair))} // Replace with your actual data keys
              youtubeUrl={generateYouTubeUrl(urlPair)} // Replace with your actual data keys
            />
          ))}
        </div>
      </div>
      {/*<div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <input
          style={{ border: '2px solid black', borderRadius: '15px', padding: '5px', textAlign: 'center' }}
          onChange={(e) => setid(e.target.value)}
          placeholder='ID Search...'
          value={id}
          onKeyDown={retrieve}
        />
      </div>*/}
    </main>
  );
}
