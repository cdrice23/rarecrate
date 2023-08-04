import { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../../core/hooks/useLocalStorage';

export interface StateInt {
  userId?: number;
  email?: string;
  profileIdMain?: number;
  usernameMain?: string;
  setUserId: (val: number | null) => void;
  setEmail: (val: string) => void;
  setProfileIdMain: (val: number | null) => void;
  setUsernameMain: (val: string) => void;
}

const stateContextDefaults: StateInt = {
  userId: null,
  email: '',
  profileIdMain: null,
  usernameMain: '',
  setUserId: () => {},
  setEmail: () => {},
  setProfileIdMain: () => {},
  setUsernameMain: () => {},
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

  const sharedState: StateInt = {
    userId,
    email,
    profileIdMain,
    usernameMain,
    setUserId,
    setEmail,
    setProfileIdMain,
    setUsernameMain,
  };

  return <LocalStateContext.Provider value={sharedState}>{children}</LocalStateContext.Provider>;
}

export function useLocalState() {
  return useContext(LocalStateContext);
}
