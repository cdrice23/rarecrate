import React, { useEffect, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import cx from 'classnames';
import axios from 'axios';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_PROFILE_PIC_URL, GET_PROFILE_IMAGE } from '@/db/graphql/clientOperations';
import useSignedUrls from '@/core/hooks/useSignedUrl';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const EditProfilePic = ({ profileData }) => {
  const [profilePic, setProfilePic] = useState([]);
  // const [existingProfilePic, setExistingProfilePic] = useState<boolean>(false);
  const signedUrl = useSignedUrls(profileData.username);

  console.log(signedUrl);

  const [updateProfilePicUrl] = useMutation(UPDATE_PROFILE_PIC_URL);
  const { loading, error, data } = useQuery(GET_PROFILE_IMAGE, {
    variables: { id: profileData.id },
  });

  const handleUpload = async () => {
    const file = profilePic[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/api/s3/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url } = response.data;
      await updateProfilePicUrl({ variables: { id: profileData.id, url } });
    } catch (error) {
      console.error('Failed to upload file', error);
    }
  };

  const handleRemove = async () => {
    try {
      await axios.delete('http://localhost:3000/api/s3/image', {
        data: {
          key: profileData.url.split('/').pop(),
        },
      });

      await updateProfilePicUrl({ variables: { id: profileData.id, url: null } });
    } catch (error) {
      console.error('Failed to remove file', error);
    }
  };

  // useEffect(() => {
  //   if (data && data.getProfile) {
  //     setExistingProfilePic(true);
  //   } else {
  //     setExistingProfilePic(false);
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (signedUrl && signedUrl !== null) {
  //     axios
  //       .get(signedUrl, { responseType: 'blob' })
  //       .then(response => {
  //         const blob = new Blob([response.data], { type: 'image/jpeg' });
  //         const file = new File([blob], profileData.username);
  //         setProfilePic([file]);
  //       })
  //       .catch(error => {
  //         console.error('Failed to fetch file', error);
  //       });
  //   } else {
  //     setProfilePic([]);
  //   }
  // }, [signedUrl, profileData.username]);

  return (
    <div>
      {/* {existingProfilePic && (
        <div>
          <ProfilePic username={profileData.username} size={100} />
        </div>
      )} */}
      <FilePond
        files={profilePic}
        onupdatefiles={setProfilePic}
        allowMultiple={false}
        server="http://localhost:3000/api/s3/image"
        name="profilePic"
      />
      <button onClick={handleUpload}>Upload</button>
      <button onClick={handleRemove}>Remove Current Pic</button>
    </div>
  );
};

export { EditProfilePic };
