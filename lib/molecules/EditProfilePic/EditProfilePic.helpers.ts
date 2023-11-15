import axios from 'axios';

export const defaultImageUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export const handleDeleteExistingProfilePic = async (
  username,
  profileId,
  updateProfilePicUrl,
  router,
  onClose,
  setIsDeleting,
) => {
  setIsDeleting(true);
  try {
    await axios.delete(`http://localhost:3000/api/s3/image?key=${username}.jpg`);

    await updateProfilePicUrl({ variables: { profileId, url: null } });
    router.reload();
  } catch (error) {
    console.error('Failed to remove file', error);
    setIsDeleting(false);
    onClose();
  }
};

export const handleImageChange = (event, cropper, setUploadedImage, setPreviousImage, fileInputRef) => {
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

export const handleCancel = onCancel => {
  onCancel(false);
};

export const handleChangeProfilePic = async onEdit => {
  onEdit(true);
};

export const handleImageUpload = async (
  cropper,
  hasCurrentPic,
  updateProfilePicUrl,
  profileId,
  username,
  router,
  setImageRefreshKey,
  setIsUploading,
) => {
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
    } catch (error) {
      console.error('Failed to upload file', error);
      setImageRefreshKey(Date.now());
      setIsUploading(false);
    }
  }
};
