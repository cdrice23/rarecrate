import { PaneType } from '@/lib/context/state';
export interface FullSearchControllerProps {
  searchPrompt: string;
  activePane: PaneType;
  prevActivePane: PaneType;
  searchPath: {
    topTier?: { type: string; name: string; id: number };
    midTier?: { type: string; name: string; id: number };
  };
  setSearchPath: (value) => void;
  setActivePane: (val: PaneType) => void;
  setPrevActivePane: (val: PaneType) => void;
}
