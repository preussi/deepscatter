import React from 'react';
import ProgressBar from './ProgressBar';

const extractVideoID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const SongTile = ({ title, artist, score, youtubeUrl }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${extractVideoID(youtubeUrl)}/maxresdefault.jpg`;
  const youtubeLink = `https://www.youtube.com/watch?v=${extractVideoID(youtubeUrl)}`;

  // Determine whether title or artist should animate based on their length
  const shouldAnimateTitle = title.length > 20; // Example condition
  const shouldAnimateArtist = artist.length > 20; // Example condition

  const tileStyle = {
    width: '250px',
    height: '250px',
    backgroundImage: `url(${thumbnailUrl})`,
    backgroundSize: 'cover',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px',
    margin: '10px',
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
  };
  
  const playButtonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60px',
    height: '60px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white for the blur background
    borderRadius: '50%', // Circular shape
    position: 'absolute',
    backdropFilter: 'blur(8px)', // Blurred background
    WebkitBackdropFilter: 'blur(8px)', // For Safari
  };

  const playIconStyle = {
    width: '60px', // Play icon size
    height: '60px', // Play icon size
    fill: 'black', // Icon color
    border: '1px black solid', // White border around the icon
    borderRadius: '50%', // Circular shape
  };

  const textContainerStyle = {
    background: 'rgba(255, 255, 255, 0.5)',
    color: 'black',
    padding: '5px',
    textAlign: 'center',
    width: '100%',
    position: 'absolute',
    top: '30px',
    left: '0',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
  };

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0',
    animation: shouldAnimateTitle ? 'scrollText 10s linear' : 'none',
    animationIterationCount: shouldAnimateTitle ? '1' : 'none',
  };

  const artistStyle = {
    fontWeight: 'normal',
    fontSize: '16px',
    margin: '0',
    color: 'rgba(0, 0, 0, 0.6)', // Lighter text for the artist
    animation: shouldAnimateArtist ? 'scrollText 10s linear' : 'none',
    animationIterationCount: shouldAnimateArtist ? '1' : 'none',
  };

  const progressBarContainerStyle = {
    position: 'absolute',
    bottom: '10px',
    padding: '20px',
    width: '100%',
  };


  return (
    <a href={youtubeLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div style={tileStyle}>
        <div style={textContainerStyle}>
          <div style={titleStyle}>{title}</div>
          <div style={artistStyle}>{artist}</div>
        </div>
        {/* Play button with circular blur around it */}
        <div style={playButtonContainerStyle}>
          <svg style={playIconStyle} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div style={progressBarContainerStyle}>
          <ProgressBar score={score} />
        </div>
      </div>
    </a>
  );
};

export default SongTile;
