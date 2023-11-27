import { CrateAlbumData } from '../CrateAlbum/CrateAlbum.types';

export type ProfileBadgeData = {
  id: number;
  username: string;
  image: string;
};

export type LabelData = {
  id: number;
  name: string;
  isStandard: boolean;
};

export type CrateDetailData = {
  id: string;
  title: string;
  description: string;
  creator: ProfileBadgeData;
  favoritedBy: ProfileBadgeData[];
  isRanked: boolean;
  labels: LabelData[];
  albums: CrateAlbumData[];
};

export interface CrateDetailFaceProps {
  data: CrateDetailData;
  editable?: boolean;
  profileId?: number;
  userProfiles?: [{ id: number; username: string }];
  handleSwitch: (newFace: 'front' | 'back') => void;
  handleEdit?: () => void;
}

export interface CrateDetailProps {
  userProfiles: [{ id: number; username: string }];
  activeCrateId?: number;
  show?: boolean;
  currentProfile: string;
  onClose: () => void;
}
