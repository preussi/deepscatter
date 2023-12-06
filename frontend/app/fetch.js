// useFetchHtmlAndUrls.js
import { useState, useEffect } from 'react';

const useFetchHtmlAndUrls = () => {
  const [urls, setUrls] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Fetch HTML file content when the hook is used
    fetch('') // Replace with the actual path to your HTML file
      .then((response) => response.text())
      .then((data) => setHtmlContent(data))
      .catch((error) => console.error('Error fetching HTML content:', error));
  }, []); // The empty array means this effect will only run once, similar to componentDidMount

  return { urls, setUrls, htmlContent, setHtmlContent };
};

export default useFetchHtmlAndUrls;