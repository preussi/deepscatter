'use client'
import React, { useState, useEffect } from 'react';
import SongTile from './SongTile';
import AudioPlayer from './AudioPlayer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCaretDown } from '@fortawesome/free-solid-svg-icons';

const server = 'http://ee-tik-vm054.ethz.ch:8000';
const deepscatter = 'http://82.130.102.10:3344'

export default function Home() {
  const [selectedDataset, setSelectedDataset] = useState('fma');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [query, setQuery] = useState(''); // State for the first input
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [audioSource, setAudioSource] = useState(''); // State to manage audio source

  const datasetConfigs = {
    disco: { isOnline: true },
    yt8m: { isOnline: true },
    musiccaps: { isOnline: true }, // Example of an offline dataset
    vctk: { isOnline: false },
    ESC50: { isOnline: false },
    jamendo: { isOnline: false },
    fma: { isOnline: false }
  };

  const InfoModal = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
  
    return (
      <div style={{
        position: 'fixed', // Overlay the whole page
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100, // Ensure it's above everything else
      }}>
        <div style={{
          width: '70%', // Adjust size as needed
          minHeight: '30%', // Adjust size as needed
          backgroundColor: 'white', // Background color of the modal
          padding: '20px',
          borderRadius: '8px', // Optional: for styled corners
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h2>Information</h2>
          <p>Audio Atlas is website for visualizing vecotral databases. It uses Milvus DB for storing and retrieving data embeddings.
            For visualizing the data, it uses DeepScatter, a tool utilising WebGL for efficiently rendering a 2D dot scatter. We provide a couple of databases to explore. 
            Users can search the databases by uploading an audio file or by typing a query.
          </p>
          <button onClick={onClose} style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>Close</button>
        </div>
      </div>
    );
  };
  
  const handleOpenModal = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  const triggerFileInputClick = () => {
    document.getElementById('fileInput').click(); // Programmatically click the invisible file input
  };


  const handleDrop = (event) => {
    event.preventDefault(); // Prevent the default file open behavior
    setIsDragging(false); // Update dragging state
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0]; // Assuming only one file is handled
      handleFileUpload({ target: { files: [file] } }); // Mimic the event structure expected by handleFileUpload
    }
  };

  // Add an onDragOver handler to prevent the browser's default behavior
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true); // Update dragging state
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false); // Update dragging state
  }

  const handleDragEnter = (event) => {  
    event.preventDefault();
    setIsDragging(true); // Update dragging state
  }
  
  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
    const iframe = document.getElementById('deepscatterIframe');
    const message = { type: 'SELECT_DATASET', dataset: event.target.value };
    console.log('Sending message to iframe:', message);
    if (iframe && 'contentWindow' in iframe) {
      iframe.contentWindow.postMessage(message, deepscatter);
    }
  };

  const getYouTubeThumbnail = (id, quality = 'default') => {
    const baseThumbnailUrl = 'https://img.youtube.com/vi/';
    let qualityPath;
    switch (quality) {
        case 'high':
            qualityPath = 'hqdefault.jpg';
            break;
        case 'medium':
            qualityPath = 'mqdefault.jpg';
            break;
        case 'standard':
            qualityPath = 'sddefault.jpg';
            break;
        case 'max':
            qualityPath = 'maxresdefault.jpg';
            break;
        default:
            qualityPath = 'default.jpg';
    }

    if (selectedDataset === 'disco') {
      const urlObj = new URL(id);
      const link = urlObj.searchParams.get('v');
      return `${baseThumbnailUrl}${link}/${qualityPath}`;
    } else {
      return `${baseThumbnailUrl}${id}/default.jpg`;
    }

  }

  const generateAudioLink = (id) => {
    let parts = id.split("\\");
    // Get the last part of the array
    let fileName = parts[parts.length - 1];
    console.log('File name:', fileName);
    if (selectedDataset === 'jamendo') {
      parts = fileName.split('/');
      console.log('Parts:', parts);
      fileName = parts[4]; 
      console.log('File name:', fileName);
      fileName = fileName + '.low.mp3'; // add the file extension
    }
    if (selectedDataset === 'fma') {
      fileName = `${fileName}.mp3`;
    }
    const path = `${server}/data/audio/${selectedDataset}/${fileName}`
    console.log('Generated audio path:', path);
    return path;
  };
  
  
  const generateYouTubeUrl = (id) => {
    let startTime = '';
    if (selectedDataset === 'disco') {
      const urlObj = new URL(id.link);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Handling YouTube URL short format e.g., https://youtu.be/ID
      const pathSegments = urlObj.pathname.split('/');
      const shortVideoId = pathSegments.length > 1 ? pathSegments[1] : null;
      if (shortVideoId) {
        return `https://www.youtube.com/embed/${shortVideoId}`;
      }
    }
    if (selectedDataset === 'yt8m') {
      const time = id.start;
      // Append the start time parameter if a valid time is provided
      if (time && !isNaN(time)) {
        startTime = `?start=${time}`;
      }
    }

    if (selectedDataset === 'musiccaps') {
      const time = id.start_s;
      // Append the start time parameter if a valid time is provided
      if (time && !isNaN(time)) {
        startTime = `?start=${time}`;
      }
    }
    return `https://www.youtube.com/embed/${id.link}${startTime}`
  };

  const iframeSrc = deepscatter+`/${selectedDataset}.html`;

  function filterUniqueById(jsonResponse) {
    console.log("Filtering unique IDs from response:", jsonResponse);
    const uniqueIds = new Set();
    return jsonResponse.filter(obj => {
      const id = obj.id; // Assuming the first element is the ID field
      if (uniqueIds.has(id)) {
        return false;
      } else {
        uniqueIds.add(id);
        return true;
      }
    });
  }

  /*const sampleQueries = ["Jazzy Ballades", "2000s european electro", "best song ever", "Top Hits"];

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
  }, []);*/
  
  const generateMetadataContent = () => {
    if (urls.length > 0) {
      const mainResult = urls[0];
  
      return (
        <div>
          {Object.entries(mainResult).map(([key, value], index) => {
            // Optionally, skip rendering for certain keys
            if (key === 'id' || key === 'link' || key === 'x' || key === 'y') return null;;
            // Customize the display name for specific keys
            const displayName = key.split('_').join(' ').replace(/(\b\w)/gi, match => match.toUpperCase()); // Converts snake_case to Title Case
            if (displayName === 'Class') {
              return <p key={index}>{`Zero-shot classification: ${value ?? "Unknown"}`}</p>;
            }
            // Return a div or paragraph for each field
            return <p key={index}>{`${displayName}: ${value ?? "Unknown"}`}</p>;
          })}
        </div>
      );
    }
  
    return <p>No results to display.</p>; // Fallback text in JSX format
  };
  
  const handleFileUpload = async (event) => {
    setIsLoading(true); // Start loading
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dataset", selectedDataset);
  
      try {
        const response = await fetch(server+'/upload-audio/', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = filterUniqueById(await response.json());
        setSearchInitiated(true);
        setUrls(data);
        setAudioSource(generateAudioLink(data[0].link));
        setIsOverlayVisible(true);

        if (data && data.length > 0) {
          const message = {
            type: 'searchZoom',
            x: data[0].x,
            y: data[0].y
          };
  
          const iframe = document.getElementById('deepscatterIframe');
          if (iframe && 'contentWindow' in iframe) {
            iframe.contentWindow.postMessage(message, deepscatter);
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
      }
    }
    setIsLoading(false); // End loading
  };

  const resultsRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchInitiated && isOverlayVisible && resultsRef.current && !resultsRef.current.contains(event.target)) {
        setSearchInitiated(false); // Hide the results
        setIsOverlayVisible(false); // Hide overlay
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchInitiated, isOverlayVisible]); // You might not need to include resultsRef in the dependencies array

  const handleSearchKeyDown = async (event) => {
    if (event.key === 'Enter') {
      try {

        // Construct the search URL dynamically to include the selected dataset
        let searchUrl = server+`/search/${query}/${selectedDataset}`;
  
        const response = await fetch(searchUrl); // No need to append query here as it's included above
        const data = filterUniqueById(await response.json());
        setTimeout(() => {
          setUrls(data);
          setAudioSource(generateAudioLink(data[0].link));
          setSearchInitiated(true);
          setIsOverlayVisible(true);
        }, 3000);
  
  
        // Access fields of the data array here
        if (data && data.length > 0) {
          const message = {
            type: 'searchZoom',
            x: data[0].x,
            y: data[0].y
          };
  
          const iframe = document.getElementById('deepscatterIframe');
          if (iframe && 'contentWindow' in iframe) {
            iframe.contentWindow.postMessage(message, deepscatter);
          }
        }
  
        console.log("Search results:", data); // Debug log
      } catch (error) {
        console.error("Could not fetch search results:", error);
      }
    }
  };
  
  const retrieve = async (id) => {
    try {
      // Include the dataset in the API call
      let url = server+`/retrieve/${id}/${selectedDataset}`;
      const response = await fetch(url);
      const data = filterUniqueById(await response.json());
      setAudioSource(generateAudioLink(data[0].link));
      setSearchInitiated(true);
      setUrls(data);
      setIsOverlayVisible(true);
      if (data && data.length > 0) {
        const message = {
          type: 'searchZoom',
          x: data[0].x,
          y: data[0].y
        };
        console.log('Sending message to iframe:', message);

        const iframe = document.getElementById('deepscatterIframe');
        if (iframe && 'contentWindow' in iframe) {
          iframe.contentWindow.postMessage(message, deepscatter);
        }
      }
    } catch (error) {
      console.error("Could not fetch search results:", error);
    }
  };

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.origin !== deepscatter) // Adjust this to match your iframe's origin
        return;
      if (event.data.type === 'DRAG_OVER_IFRAME') {
        setIsDragging(true);
      } else if (event.data.type === 'DROP_ON_IFRAME') {
        setIsDragging(false);
      } else if (event.data.type === 'NODE_CLICKED') {
        retrieve(event.data.id);
      }
    };
  
    window.addEventListener('message', handleIframeMessage);
  
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [selectedDataset]);

  const renderContent = (item) => {
    const datasetConfig = datasetConfigs[selectedDataset];
    if (datasetConfig.isOnline) {
      return (
        <iframe
          src={generateYouTubeUrl(item)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Video Player"
        />
      );
    } else {
      // Render audio player for offline content
      const trackUrl = audioSource;
      return (
        <div style={{ width: '100%', alignItems: 'center' }}>
        <AudioPlayer audioSource={trackUrl} />
        </div>
      );
    }
  };

  const generateSongTile = (item, index) => {
    const { link, title } = item;
    const thumbnailUrl = datasetConfigs[selectedDataset].isOnline ? getYouTubeThumbnail(link, 'max') : undefined;
    return (
      <SongTile
        key={index}
        title={title}
        thumbnailUrl={thumbnailUrl}
        onClick={() => retrieve(item.id)}
      />
    );
  };


  const searchBarStyle = {
    outline: 'none',
    margin: '0 10px',
    color: 'white',    
    backgroundColor: 'transparent',
  };

  const topBarStyle = {
    zIndex: 2,
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
  };

  const searchContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    maxWidth: '500px',
    padding: '6px 8px',
    borderRadius: '15px',
    border: '1px solid white',
  };

  const invisibleSpacerStyle = {
    // Mimic the style of your dataset selector but make it invisible
    visibility: 'hidden',
    width: '15%'
  };

  const searchResultsContainerStyle = {
    display: 'flex', 
    flexDirection: 'column',
    maxWidth: '700px', // Adjust the width as needed
    width: '50%', // Adjust the width as needed
    zIndex: 2,
    overflowY: 'auto', // Enable scrolling for overflow
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    padding: '10px', // Add some padding
    borderRadius: '20px', // Optional, for rounded corners
  };

  const sideBarStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    margin: '10px',
    width: '15%',
  };
  const mainResultStyle = {
    width: '100%', // Taking full width of the container
    height: '40vh', // Using 50% of the viewport height to make it take more vertical space
    border: '1px solid gray', // Add border as needed
    borderRadius: '10px', // Optional, for rounded corners
    borderBlur: '10px', // Optional, for a blurred border
  };

  // Adjusted style for the container of additional results
  const additionalResultsStyle = {
    overflowY: 'auto', 
    padding: '10px',
    borderRadius: '10px', // Optional, for rounded corners
    borderBlur: '10px', // Optional, for a blurred border
  };

  // Style for the additional metadata container
  const metadataContainerStyle = { 
    padding: '10px', // Add padding as needed
    color: 'white', // Text color
    margin: '10px 0', // Add margin as needed
    minheight: '150px', // Set a minimum height
    // Add other styles as needed
  };

  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);

  if (isMobileDevice) {
    searchResultsContainerStyle.width = '90%';
    mainResultStyle.height = '25vh';
    searchBarStyle.width = '100%';
    sideBarStyle.width = '30%';
    metadataContainerStyle.fontSize = '14px';
    metadataContainerStyle.height = '150px';
    metadataContainerStyle.overflowY = 'auto';
  }

  return (
    <>
      <main style={{ 
          position: 'fixed', 
          height: '100vh', 
          width: '100vw', 
          overflow: 'hidden',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start', // Align items to the start of the main axis
        }}>
          <div
            id="overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: isOverlayVisible ? 'block' : 'none',
              zIndex: 1, // Make sure this is below your search result's z-index
              backgroundColor: 'rgba(0,0,0,0.5)', // Optional: for dimming background
            }}
          />
            <iframe 
              src={iframeSrc}  
              id="deepscatterIframe"
              style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '100%', border: 'none', zIndex: 0 }}
            ></iframe>
          {/*Topbar*/}
          <div style={topBarStyle}>
            {/* This div wraps the search input and browse button, making it the "search container" */}
            {!isMobileDevice && <div style={invisibleSpacerStyle}></div>}
            <div style={searchContainerStyle}>
              <input
                style={{ ...searchBarStyle, flexGrow: 1}}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search Audio Atlas'
                value={query}
                onKeyDown={handleSearchKeyDown}
              />
              <button onClick={triggerFileInputClick} style={{
                background: 'none',
                scale: '0.9',
                color: 'white',
                border: '1px dashed white',
                borderRadius: '10px',
                cursor: 'pointer',
                padding: '8px 12px',
              }}>
                Upload
              </button>
              <input
                type="file"
                id="fileInput"
                accept=".mp3,.wav"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
            <div style={sideBarStyle}>
              <select onChange={handleDatasetChange} style={{background:'transparent', color:'white', listStyle:'revert', marginRight:'10px', overflow: 'hidden'}}>              
                <option value="fma">FMA</option>
                <option value="jamendo">Jamendo</option>
                <option value="yt8m">YT8M MTC</option>
                <option value="musiccaps">MusicCaps</option>
                <option value="vctk">VCTK</option>
                <option value="ESC50">ESC-50</option>
              </select>
              {/* Info Icon Button */}
              {/*<button onClick={handleOpenModal} style={{color: 'white', cursor: 'pointer', scale: '1.2'}}>
                <FontAwesomeIcon icon={faInfoCircle} />
              </button> */}
            </div>
          </div>
          {/* Search Results */}
          {(searchInitiated) && (
              <div style={searchResultsContainerStyle} ref={resultsRef}>
                {/* Main Result Div */}
                {urls.length > 0 && (
                  renderContent(urls[0])
                )}
                <div style={metadataContainerStyle}>
                  {/* Display track and artist name dynamically */}
                  {generateMetadataContent()}
                </div>
                <h2 style={{ color: 'white' , textAlign: 'center'}}>Most similar according to AI</h2>
                {/* Additional Results Div */}
                {urls.length > 1 && (
                  <div style={additionalResultsStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {
                      urls.slice(1).map((item, index) => (
                        generateSongTile(item, index)
                      ))
                    }

                    </div>
                  </div>
                )}
              </div>
            )}
          {!searchInitiated && ( // Add !isMobileDevice to conditionally render this block
            <div className={`file-drop-container ${isDragging ? 'dragging' : ''}`} 
                onDrop={handleDrop} 
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}>
              {isLoading && (
                <div className="loading-animation"></div>
              )}
              {!isLoading && !isMobileDevice && (
                <p style={{ color: '#666', fontSize: '16px' }}>
                  Drag & Drop your audio file here
                </p>
              )}
              <input
                type="file"
                id="fileInput"
                accept=".mp3,.wav" // Add accepted file types as needed
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          )}

            <InfoModal isVisible={isModalVisible} onClose={handleCloseModal} />
      </main>
    </>
  );
}
