import cx from 'classnames';
import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Croppie from 'croppie';
import 'croppie/croppie.css';
import { User as UserIcon, PencilLine, Trash } from '@phosphor-icons/react';
import { UPDATE_PROFILE_PIC_URL, GET_PROFILE_IMAGE } from '@/db/graphql/clientOperations';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import {
  defaultImageUrl,
  handleDeleteExistingProfilePic,
  handleImageChange,
  handleCancel,
  handleImageUpload,
  handleChangeProfilePic,
} from './EditProfilePic.helpers';
import { EditProfilePicProps, ProfilePicPreviewProps, EditToolProps } from '@/types/molecules/EditProfilePic.types';

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
          profileId={profileData.id}
          username={profileData.username}
          hasCurrentPic={Boolean(data?.getProfile.image)}
          onCancel={setShowEditTool}
          setImageRefreshKey={setImageRefreshKey}
        />
      ) : (
        <ProfilePicPreview
          profileId={profileData.id}
          username={profileData.username}
          currentPic={data?.getProfile.image}
          onEdit={setShowEditTool}
          onClose={onClose}
          imageRefreshKey={imageRefreshKey}
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
}: ProfilePicPreviewProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [updateProfilePicUrl] = useMutation(UPDATE_PROFILE_PIC_URL);

  const router = useRouter();

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
          <button type="button" onClick={() => handleChangeProfilePic(onEdit)}>
            <PencilLine />
            <span>{`Change profile pic`}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleDeleteExistingProfilePic(username, profileId, updateProfilePicUrl, router, onClose, setIsDeleting)
            }
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

const EditTool = ({ profileId, username, hasCurrentPic, onCancel, setImageRefreshKey }: EditToolProps) => {
  const [cropper, setCropper] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previousImage, setPreviousImage] = useState(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const router = useRouter();

  const [updateProfilePicUrl] = useMutation(UPDATE_PROFILE_PIC_URL);

  let fileInputRef = useRef<HTMLInputElement>(null);

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
        <input
          type="file"
          id="imageUpload"
          onChange={event => handleImageChange(event, cropper, setUploadedImage, setPreviousImage, fileInputRef)}
        />
        <div id="cropper" className={cx('imagePreview')} />
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            handleImageUpload(
              cropper,
              hasCurrentPic,
              updateProfilePicUrl,
              profileId,
              username,
              router,
              setImageRefreshKey,
              setIsUploading,
            )
          }
          disabled={uploadedImage === null || isUploading}
        >
          Done
        </button>
      </div>
    </>
  );
};
