import axios from 'axios';
import cx from 'classnames';
import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Croppie from 'croppie';
import 'croppie/croppie.css';
import { User as UserIcon, PencilLine, Trash } from '@phosphor-icons/react';
import { UPDATE_PROFILE_PIC_URL, GET_PROFILE_IMAGE } from '@/db/graphql/clientOperations';
import { ProfilePic } from '../ProfilePic/ProfilePic';

interface EditProfilePicProps {
  profileData: { username: string; id: number };
  onClose: () => void;
  imageRefreshKey: number;
  setImageRefreshKey: (value: number) => void;
}

interface ProfilePicPreviewProps {
  profileId: number;
  username: string;
  currentPic: string;
  onEdit: (value) => void;
  onClose: () => void;
  imageRefreshKey: number;
  setImageRefreshKey: (value: number) => void;
  setShowEditTool: (value: boolean) => void;
}

interface EditToolProps {
  profileId: number;
  username: string;
  onCancel: (value) => void;
  onClose: () => void;
  hasCurrentPic: boolean;
  imageRefreshKey: number;
  setImageRefreshKey: (value: number) => void;
  setShowEditTool: (value: boolean) => void;
}

const EditProfilePic = ({ profileData, onClose, imageRefreshKey, setImageRefreshKey }: EditProfilePicProps) => {
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
          onClose={onClose}
          setShowEditTool={setShowEditTool}
          imageRefreshKey={imageRefreshKey}
          setImageRefreshKey={setImageRefreshKey}
        />
      ) : (
        <ProfilePicPreview
          username={profileData.username}
          onEdit={setShowEditTool}
          profileId={profileData.id}
          currentPic={data?.getProfile.image}
          onClose={onClose}
          setShowEditTool={setShowEditTool}
          imageRefreshKey={imageRefreshKey}
          setImageRefreshKey={setImageRefreshKey}
        />
      )}
    </div>
  );
};

export { EditProfilePic };

const ProfilePicPreview = ({
  profileId,
  username,
  currentPic,
  onEdit,
  onClose,
  imageRefreshKey,
  setImageRefreshKey,
  setShowEditTool,
}: ProfilePicPreviewProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [updateProfilePicUrl] = useMutation(UPDATE_PROFILE_PIC_URL);

  const router = useRouter();

  const handleDeleteExistingProfilePic = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/api/s3/image?key=${username}.jpg`);

      await updateProfilePicUrl({ variables: { profileId, url: null } });
      router.reload();
      // setImageRefreshKey(Date.now());
      // setIsDeleting(false);
      // setShowEditTool(false);
      // onClose();
    } catch (error) {
      console.error('Failed to remove file', error);
      setIsDeleting(false);
      onClose();
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
          <ProfilePic key={Number(imageRefreshKey)} username={username} size={100} />
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
            disabled={currentPic === null || isDeleting}
          >
            <Trash />
            <span>{`Delete existing pic`}</span>
          </button>
        </div>
      </div>
    </>
  );
};

const EditTool = ({
  profileId,
  username,
  hasCurrentPic,
  onCancel,
  onClose,
  imageRefreshKey,
  setImageRefreshKey,
  setShowEditTool,
}: EditToolProps) => {
  const [cropper, setCropper] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previousImage, setPreviousImage] = useState(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const router = useRouter();

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
      setUploadedImage(null);
    }
  };

  const handleImageUpload = async () => {
    setIsUploading(true);
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
        // Update Prisma
        await updateProfilePicUrl({ variables: { profileId, url: data.url.substring(0, data.url.indexOf('?')) } });
        router.reload();
        // setImageRefreshKey(Date.now());
        // setIsUploading(false);
        // setShowEditTool(false);
        // onClose();
      } catch (error) {
        console.error('Failed to upload file', error);
        setImageRefreshKey(Date.now());
        setIsUploading(false);
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
        <button type="button" onClick={handleImageUpload} disabled={uploadedImage === null || isUploading}>
          Done
        </button>
      </div>
    </>
  );
};
