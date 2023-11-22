export interface ProfileFormProps {
  existingProfileData?: any;
  userId?: number;
  setShowEditProfile?: (value: boolean) => void;
  imageRefreshKey: number;
  setImageRefreshKey: (value: number) => void;
}
