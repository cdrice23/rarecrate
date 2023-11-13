import { useEffect, useState } from 'react';
import axios from 'axios';

const useSignedUrl = key => {
  const [url, setUrl] = useState(null);

  const fetchUrl = async key => {
    try {
      const url = await axios.get(`http://localhost:3000/api/s3/image?key=${key}.jpg`);
      return url.data.url;
    } catch (error) {
      if (error.response) {
        console.error('Failed to fetch URL:', error);
        return null;
      } else {
        throw error;
      }
    }
  };

  useEffect(() => {
    const fetchUrls = async () => {
      const url = await fetchUrl(key);
      setUrl(url);
    };

    fetchUrls();
  }, [key]);

  return url;
};

export default useSignedUrl;
