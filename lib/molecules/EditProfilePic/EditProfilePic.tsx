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
  const { error, loading, data } = useQuery(GET_PROFILE_IMAGE, {
    variables: {
      id: profileData.id,
    },
  });

  return (
    <div>
      {showEditTool ? (
        <EditTool
          username={profileData.username}
          onCancel={setShowEditTool}
          profileId={profileData.id}
          hasCurrentPic={Boolean(data?.getProfile.image)}
        />
      ) : (
        <ProfilePicPreview
          username={profileData.username}
          onEdit={setShowEditTool}
          profileId={profileData.id}
          currentPic={data?.getProfile.image}
        />
      )}
    </div>
  );
};

export { EditProfilePic };

const ProfilePicPreview = ({ profileId, username, onEdit, currentPic }) => {
  const [updateProfilePicUrl] = useMutation(UPDATE_PROFILE_PIC_URL);

  const handleDeleteExistingProfilePic = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/s3/image?key=${username}.jpg`);

      await updateProfilePicUrl({ variables: { profileId, url: null } });
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
        {currentPic !== null ? (
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
            disabled={currentPic === null}
          >
            <Trash />
            <span>{`Delete existing pic`}</span>
          </button>
        </div>
      </div>
    </>
  );
};

const EditTool = ({ profileId, username, onCancel, hasCurrentPic }) => {
  const [cropper, setCropper] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previousImage, setPreviousImage] = useState(null);

  const [updateProfilePicUrl] = useMutation(UPDATE_PROFILE_PIC_URL);

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
    if (cropper) {
      let quality = 1.0;
      let response: Blob | null = null;

      do {
        response = await new Promise<Blob>((resolve, reject) =>
          cropper.result('blob', { type: 'image/jpeg', quality: quality }).then(resolve).catch(reject),
        );

        quality -= 0.01;
      } while (response.size > 1024 * 1024); // 1 MB

      const formData = new FormData();
      if (typeof username === 'string') {
        formData.append('file', new File([response], `${username}.jpg`, { type: 'image/jpeg' }));
      } else {
        console.error('Invalid username', username);
        return;
      }

      try {
        // Delete existing photo if already exists
        if (hasCurrentPic) {
          try {
            await axios.delete(`http://localhost:3000/api/s3/image?key=${username}.jpg`);

            await updateProfilePicUrl({ variables: { profileId, url: null } });
          } catch (error) {
            console.error('Failed to remove file', error);
          }
        }

        // Upload new photo
        const { data } = await axios.post('http://localhost:3000/api/s3/image', {
          username: typeof username === 'string' ? username : '',
        });

        await axios.put(data.url, response, {
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });
        // Update Prisma here
        await updateProfilePicUrl({ variables: { id: profileId, url: data.url } });
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
