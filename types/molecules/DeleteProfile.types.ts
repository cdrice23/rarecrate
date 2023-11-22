export interface DeleteProfileProps {
  profileToDelete: number;
  usernameToDelete: string;
  userProfiles: Array<{ id: number; username: string } | { isAddProfile: boolean }>;
  onClose: () => void;
  setIsDeleting: (value) => void;
  handleUpdateProfileList: (deletedProfile: number) => void;
}
