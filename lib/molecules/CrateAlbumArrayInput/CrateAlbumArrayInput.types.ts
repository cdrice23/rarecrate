export interface CrateAlbumArrayInputProps {
  value: any[];
  isRanked: boolean;
}

export type QueriedAlbum = {
  id?: number;
  title: string;
  artist: string;
  imageUrl: string;
  discogsMasterId: string;
  isNew?: boolean;
};
