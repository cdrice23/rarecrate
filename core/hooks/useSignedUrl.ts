import { useEffect, useState } from 'react';
import axios from 'axios';

const useSignedUrl = key => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (key) {
      axios.get(`http://localhost:3000/api/s3/image?key=${key}.jpg`).then(res => setUrl(res.data.url));
    }
  }, [key]);

  return url;
};

export default useSignedUrl;
