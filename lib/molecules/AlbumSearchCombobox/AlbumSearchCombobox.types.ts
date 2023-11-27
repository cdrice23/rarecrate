export interface AlbumSearchComboboxProps {
  value: string;
  enterHandler: (album: any) => void;
  updateSearchPrompt: (value: string) => void;
  listItems: any[];
  searchQuery: any;
  loading: boolean;
  triggerDiscogsSearch: boolean;
}
