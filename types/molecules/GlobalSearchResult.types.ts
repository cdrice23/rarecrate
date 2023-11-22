export interface GlobalSearchResultProps {
  data: any;
  index: number;
  lastSlice?: number;
  getMoreItems?: () => void;
}
