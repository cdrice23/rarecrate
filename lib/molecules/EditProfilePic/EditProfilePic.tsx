import React, { useEffect, useState, useRef } from 'react';
import Croppie from 'croppie';
import 'croppie/croppie.css';
import axios from 'axios';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_PROFILE_PIC_URL, GET_PROFILE_IMAGE } from '@/db/graphql/clientOperations';
import cx from 'classnames';
import { User as UserIcon, PencilLine, Trash } from '@phosphor-icons/react';
import { ProfilePic } from '../ProfilePic/ProfilePic';

const EditProfilePic = ({ profileData }) => {
  const [showEditTool, setShowEditTool] = useState<boolean>(false);

  return (
    <div>
      {showEditTool ? (
        <EditTool onCancel={setShowEditTool} />
      ) : (
        <ProfilePicPreview username={profileData.username} onEdit={setShowEditTool} profileId={profileData.id} />
      )}
    </div>
  );
};

export { EditProfilePic };

const ProfilePicPreview = ({ profileId, username, onEdit }) => {
  const [updateProfilePicUrl] = useMutation(UPDATE_PROFILE_PIC_URL);
  const { error, loading, data } = useQuery(GET_PROFILE_IMAGE, {
    variables: {
      id: profileId,
    },
  });

  const handleDeleteExistingProfilePic = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/s3/image?key=${username}.jpg`);

      await updateProfilePicUrl({ variables: { id: profileId, url: null } });
    } catch (error) {
      console.error('Failed to remove file', error);
    }
  };

  const handleChangeProfilePic = async () => {
    console.log('You want to upload a new photo');
    onEdit(true);
  };

  return (
    <>
      <div className={cx('profilePicPreview')}>
        {data?.getProfile.image ? (
          <ProfilePic username={username} size={100} />
        ) : (
          <div className={cx('profilePicIcon')}>
            <UserIcon size={36} />
          </div>
        )}
        <div className={cx('editButtons')}>
          <button type="button" onClick={handleChangeProfilePic}>
            <PencilLine />
            <span>{`Change profile pic`}</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteExistingProfilePic}
            className={cx('deleteProfilePic')}
            disabled={data?.getProfile.image === null}
          >
            <Trash />
            <span>{`Delete existing pic`}</span>
          </button>
        </div>
      </div>
    </>
  );
};

const EditTool = ({ onCancel }) => {
  const [cropper, setCropper] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previousImage, setPreviousImage] = useState(null);

  let fileInputRef = useRef<HTMLInputElement>(null);

  const defaultImageUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  const handleCancel = () => {
    onCancel(false);
  };

  const handleImageChange = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (cropper) {
          cropper.bind({
            url: reader.result as string,
          });
          setPreviousImage(event.target.value);
        }
        setUploadedImage(reader.result as string);
      };

      reader.readAsDataURL(file);
      fileInputRef.current = event.target;
    } else if (fileInputRef.current.value === '') {
      cropper.bind({
        url: defaultImageUrl,
      });
    }
  };

  const handleImageUpload = async () => {
    if (uploadedImage) {
      const base64StringParts = uploadedImage.split(',');
      const byteString = atob(base64StringParts[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ia], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, 'profilePic.jpg');

      try {
        await axios.post('http://localhost:3000/api/s3/image', formData);
        // Update Prisma here
      } catch (error) {
        console.error('Failed to upload file', error);
      }
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
        newCropper.bind({
          url: defaultImageUrl,
        });
      }

      setCropper(newCropper);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div>
        <input type="file" id="imageUpload" onChange={handleImageChange} />
        <div id="cropper" className={cx('imagePreview')} />
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button type="button" onClick={handleImageUpload}>
          Done
        </button>
      </div>
    </>
  );
};
