export interface EditProfilePicProps {
  profileData: { username: string; id: number };
  onClose: () => void;
  imageRefreshKey: number;
  setImageRefreshKey: (value: number) => void;
}

export interface ProfilePicPreviewProps {
  profileId: number;
  username: string;
  currentPic: string;
  onEdit: (value) => void;
  onClose: () => void;
  imageRefreshKey: number;
}

export interface EditToolProps {
  profileId: number;
  username: string;
  onCancel: (value) => void;
  hasCurrentPic: boolean;
  setImageRefreshKey: (value: number) => void;
}
