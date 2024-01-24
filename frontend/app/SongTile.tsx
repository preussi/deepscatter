import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

// ...rest of your imports and utility functions (if any)...

const extractVideoID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
  
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const SongTile = ({ title, artist, youtubeUrl, spotifyPreviewUrl }) => {
    const audioRef = useRef(new Audio(spotifyPreviewUrl));
    const [isPlaying, setIsPlaying] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState(`https://img.youtube.com/vi/${extractVideoID(youtubeUrl)}/maxresdefault.jpg`);
  
    useEffect(() => {
      const testImage = new Image();
      testImage.onload = () => {
        if (testImage.naturalWidth === 120 && testImage.naturalHeight === 90) {
          // Default thumbnail is loaded, use a placeholder or lower resolution
          setThumbnailUrl(`https://img.youtube.com/vi/${extractVideoID(youtubeUrl)}/0.jpg`);
        }
      };
      testImage.onerror = () => {
        // Handle error, use placeholder image
        setThumbnailUrl('path/to/your/placeholder.jpg');
      };
      testImage.src = thumbnailUrl;
    }, [youtubeUrl]);
  
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
      backgroundImage: `url(${thumbnailUrl})`,
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

export default SongTile;
