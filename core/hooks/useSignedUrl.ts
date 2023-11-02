import { useEffect, useState } from 'react';
import axios from 'axios';

const useSignedUrls = keys => {
  const [urls, setUrls] = useState([]);

  const fetchUrl = async key => {
    try {
      const url = await axios.get(`http://localhost:3000/api/s3/image?key=${key}.jpg`);
      return url.data.url;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchUrls = async () => {
      for (let key of keys) {
        const url = await fetchUrl(key);
        setUrls(prevUrls => [...prevUrls, url]);
      }
    };

    fetchUrls();
  }, [keys]);

  return urls;
};

export default useSignedUrls;
