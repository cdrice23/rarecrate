export interface DeleteAccountProps {
  userProfiles: Array<{ id: number; username: string } | { isAddProfile: boolean }>;
  onClose: () => void;
}
