import { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../../core/hooks/useLocalStorage';

export interface StateInt {
  userId?: number;
  email?: string;
  profileIdMain?: number;
  usernameMain?: string;
  globalSearchPrompt?: string;
  quickSearchResults?: any[];
  setUserId: (val: number | null) => void;
  setEmail: (val: string) => void;
  setProfileIdMain: (val: number | null) => void;
  setUsernameMain: (val: string) => void;
  setGlobalSearchPrompt?: (val: string) => void;
  setQuickSearchResults?: (val: any[]) => void;
}

const stateContextDefaults: StateInt = {
  userId: null,
  email: '',
  profileIdMain: null,
  usernameMain: '',
  globalSearchPrompt: '',
  quickSearchResults: [],
  setUserId: () => {},
  setEmail: () => {},
  setProfileIdMain: () => {},
  setUsernameMain: () => {},
  setGlobalSearchPrompt: () => {},
  setQuickSearchResults: () => {},
};

const LocalStateContext = createContext<StateInt>(stateContextDefaults);

interface PropsInt {
  children: ReactNode;
}

export function LocalStateProvider({ children }: PropsInt) {
  const [userId, setUserId] = useLocalStorage<number | null>('userId', null);
  const [email, setEmail] = useLocalStorage<string>('email', '');
  const [profileIdMain, setProfileIdMain] = useLocalStorage<number | null>('profileId', null);
  const [usernameMain, setUsernameMain] = useLocalStorage<string>('username', '');
  const [globalSearchPrompt, setGlobalSearchPrompt] = useLocalStorage<string>('globalSearchPrompt', '');
  const [quickSearchResults, setQuickSearchResults] = useLocalStorage<any[]>('quickSearchResults', null);

  const sharedState: StateInt = {
    userId,
    email,
    profileIdMain,
    usernameMain,
    globalSearchPrompt,
    quickSearchResults,
    setUserId,
    setEmail,
    setProfileIdMain,
    setUsernameMain,
    setGlobalSearchPrompt,
    setQuickSearchResults,
  };

  return <LocalStateContext.Provider value={sharedState}>{children}</LocalStateContext.Provider>;
}

export function useLocalState() {
  return useContext(LocalStateContext);
}
