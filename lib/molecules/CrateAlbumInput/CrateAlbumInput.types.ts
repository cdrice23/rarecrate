export interface CrateAlbumInputProps {
  id: number;
  data: any;
  removeHandler: () => void;
  initialRank?: number;
  setFieldValue: (name, value) => void;
  isRanked: boolean;
}
