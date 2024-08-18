import React from 'react';
import defaultSongIcon from '../assets/audio-wave-512.png';  // Adjust path as necessary

const SongTile = ({ onClick, title, thumbnailUrl }) => {
  const shouldAnimateTitle = title.length > 20;
  if (title.length > 40) {
    title = title.slice(0, 40) + '...';  // Truncate long titles
  }
  // Adding a separator with spaces and dashes between duplications
  const repeatedTitle = shouldAnimateTitle ? `${title} ---  ${title}` : title;

  // Styles
  const tileStyle = {
    width: '200px',
    height: '200px',
    backgroundImage: `url(${thumbnailUrl || defaultSongIcon})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px',
    margin: '10px',
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
    backdropFilter: 'blur(50px)',
    WebkitBackdropFilter: 'blur(50px)',
  };

  const textContainerStyle = {
    padding: '10px',
    textAlign: 'left',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  };

  const textStyle = {
    whiteSpace: 'nowrap',
    display: 'inline-block',
    willChange: 'transform',
    animation: shouldAnimateTitle ? 'scrollText 14s linear infinite' : 'none',
  };

  const headerStyle = {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: '13px',
    fontWeight: 'light',
    textAlign: 'left',
    margin: '0',
  };

  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
  if (isMobileDevice) {
    tileStyle.width = '130px';
    tileStyle.height = '130px';
  }


  return (
    <div onClick={onClick} style={tileStyle}>
      <div style={textContainerStyle}>
        <p style={headerStyle}>Track:</p>
        <div style={textStyle}>{repeatedTitle}</div>  {/* Use the duplicated title with separator for the animation */}
      </div>
    </div>
  );
};

export default SongTile;
