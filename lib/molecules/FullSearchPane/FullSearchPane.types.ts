export interface FullSearchPaneProps {
  currentItems: any[];
  currentPage: number;
  searchPath: {
    topTier?: { type: string; name: string; id: number };
    midTier?: { type: string; name: string; id: number };
  };
  setSearchPath: (value) => void;
  getMoreItems?: () => void;
  getNextPane?: (value, searchId) => void;
}
