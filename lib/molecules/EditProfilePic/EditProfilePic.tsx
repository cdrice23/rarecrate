import React, { useEffect, useState, useRef } from 'react';
import Croppie from 'croppie';
import 'croppie/croppie.css';
import axios from 'axios';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_PROFILE_PIC_URL, GET_PROFILE_IMAGE } from '@/db/graphql/clientOperations';
import useSignedUrl from '@/core/hooks/useSignedUrl';
import cx from 'classnames';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { ProfilePic } from '../ProfilePic/ProfilePic';

const EditProfilePic = ({ profileData }) => {
  const [showEditTool, setShowEditTool] = useState<boolean>(false);

  return (
    <div>
      {showEditTool ? (
        <EditTool onCancel={setShowEditTool} />
      ) : (
        <ProfilePicPreview username={profileData.username} onEdit={setShowEditTool} />
      )}
    </div>
  );
};

export { EditProfilePic };

const ProfilePicPreview = ({ username, onEdit }) => {
  const handleDeleteExistingProfilePic = async () => {
    console.log('You are deleting the profile pic!');
    // try {
    //   await axios.delete('http://localhost:3000/api/s3/image', {
    //     data: {
    //       key: ,
    //     },
    //   });

    //   await updateProfilePicUrl({ variables: { id: profileData.id, url: null } });
    // } catch (error) {
    //   console.error('Failed to remove file', error);
    // }
  };

  const handleChangeProfilePic = async () => {
    console.log('You want to upload a new photo');
    onEdit(true);
  };

  return (
    <>
      <div>
        <ProfilePic username={username} size={100} />
        <div>
          <button type="button" onClick={handleChangeProfilePic}>
            Change Profile Photo
          </button>
          <button type="button" onClick={handleDeleteExistingProfilePic}>
            Delete existing photo
          </button>
        </div>
      </div>
    </>
  );
};

const EditTool = ({ onCancel }) => {
  const [cropper, setCropper] = useState(null);
  const [previousImage, setPreviousImage] = useState(null);
  // console.log(cropper);
  // console.log(previousImage);

  let fileInputRef = useRef<HTMLInputElement>(null);
  console.log(fileInputRef);

  const defaultImageUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  const handleCancel = () => {
    onCancel(false);
  };

  const handleImageUpload = event => {
    // console.log(event.target.value);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (cropper) {
          cropper.bind({
            url: reader.result,
          });
          setPreviousImage(event.target.value);
        }
      };

      reader.readAsDataURL(file);
      fileInputRef.current = event.target;
    } else if (fileInputRef.current.value === '') {
      // If no file is selected, bind the previous image to the cropper
      // console.log(previousImage);
      cropper.bind({
        url: defaultImageUrl,
        // url: fileInputRef.current.value,
      });
    }
  };

  useEffect(() => {
    if (!cropper) {
      const newCropper = new Croppie(document.getElementById('cropper'), {
        viewport: { width: 320, height: 320, type: 'circle' },
        boundary: { width: 320, height: 320 },
        showZoomer: true,
        enableExif: true,
      });

      if (!previousImage) {
        // Set default image initially
        newCropper.bind({
          url: defaultImageUrl,
        });
      }

      setCropper(newCropper);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlur = () => {
    if (fileInputRef.current && fileInputRef.current.files.length === 0 && previousImage) {
      // If no file is selected, bind the previous image to the cropper
      cropper.bind({
        url: previousImage,
      });
    }
  };

  return (
    <>
      <div>
        <input type="file" id="imageUpload" onChange={handleImageUpload} onBlur={handleBlur} />
        <div id="cropper" className={cx('imagePreview')} />
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </>
  );
};
