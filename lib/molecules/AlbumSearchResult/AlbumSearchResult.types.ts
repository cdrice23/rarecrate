export interface AlbumSearchResultProps {
  index: number;
  lastIndex: number;
  title: string;
  imageUrl: string;
  artist: string;
  lastSlice: number;
  handleDiscogsSearch: () => void;
  setCurrentPage: (value) => void;
}
