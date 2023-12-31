import { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '@/core/hooks/useLocalStorage';

export type PaneType =
  | 'profiles'
  | 'crates'
  | 'albums'
  | 'labelsAndTags'
  | 'genresAndSubgenres'
  | 'cratesFromLabel'
  | 'albumsFromTag'
  | 'albumsFromGenre'
  | 'albumsFromSubgenre'
  | 'cratesFromAlbum';

export interface StateInt {
  userId?: number;
  email?: string;
  profileIdMain?: number;
  usernameMain?: string;
  globalSearchPrompt?: string;
  quickSearchResults?: any[];
  currentActivePane?: PaneType;
  prevActivePane?: PaneType;
  setUserId: (val: number | null) => void;
  setEmail: (val: string) => void;
  setProfileIdMain: (val: number | null) => void;
  setUsernameMain: (val: string) => void;
  setGlobalSearchPrompt?: (val: string) => void;
  setQuickSearchResults?: (val: any[]) => void;
  setCurrentActivePane?: (val: PaneType) => void;
  setPrevActivePane?: (val: PaneType) => void;
  resetState: () => void;
}

export const stateContextDefaults: StateInt = {
  userId: null,
  email: '',
  profileIdMain: null,
  usernameMain: '',
  globalSearchPrompt: '',
  quickSearchResults: null,
  currentActivePane: 'profiles',
  prevActivePane: null,
  setUserId: () => {},
  setEmail: () => {},
  setProfileIdMain: () => {},
  setUsernameMain: () => {},
  setGlobalSearchPrompt: () => {},
  setQuickSearchResults: () => {},
  setCurrentActivePane: () => {},
  setPrevActivePane: () => {},
  resetState: () => {},
};

const LocalStateContext = createContext<StateInt>(stateContextDefaults);

interface PropsInt {
  children: ReactNode;
}

export function LocalStateProvider({ children }: PropsInt) {
  const [userId, setUserId] = useLocalStorage<number | null>('userId', null);
  const [email, setEmail] = useLocalStorage<string>('email', '');
  const [profileIdMain, setProfileIdMain] = useLocalStorage<number | null>('profileIdMain', null);
  const [usernameMain, setUsernameMain] = useLocalStorage<string>('usernameMain', '');
  const [globalSearchPrompt, setGlobalSearchPrompt] = useLocalStorage<string>('globalSearchPrompt', '');
  const [quickSearchResults, setQuickSearchResults] = useLocalStorage<any[]>('quickSearchResults', null);
  const [currentActivePane, setCurrentActivePane] = useLocalStorage<PaneType>('currentActivePane', 'profiles');
  const [prevActivePane, setPrevActivePane] = useLocalStorage<PaneType>('prevActivePane', null);

  const resetState = () => {
    setUserId(stateContextDefaults.userId);
    setEmail(stateContextDefaults.email);
    setProfileIdMain(stateContextDefaults.profileIdMain);
    setUsernameMain(stateContextDefaults.usernameMain);
    setGlobalSearchPrompt(stateContextDefaults.globalSearchPrompt);
    setQuickSearchResults(stateContextDefaults.quickSearchResults);
    setCurrentActivePane(stateContextDefaults.currentActivePane);
    setPrevActivePane(stateContextDefaults.prevActivePane);
  };

  const sharedState: StateInt = {
    userId,
    email,
    profileIdMain,
    usernameMain,
    globalSearchPrompt,
    quickSearchResults,
    currentActivePane,
    prevActivePane,
    setUserId,
    setEmail,
    setProfileIdMain,
    setUsernameMain,
    setGlobalSearchPrompt,
    setQuickSearchResults,
    setCurrentActivePane,
    setPrevActivePane,
    resetState,
  };

  return <LocalStateContext.Provider value={sharedState}>{children}</LocalStateContext.Provider>;
}

export function useLocalState() {
  return useContext(LocalStateContext);
}
