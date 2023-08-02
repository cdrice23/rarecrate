import { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../../core/hooks/useLocalStorage';

export interface StateInt {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
  setUserId: (val: number | null) => void;
  setEmail: (val: string) => void;
  setProfileId: (val: number | null) => void;
  setUsername: (val: string) => void;
}

const stateContextDefaults: StateInt = {
  userId: null,
  email: '',
  profileId: null,
  username: '',
  setUserId: () => {},
  setEmail: () => {},
  setProfileId: () => {},
  setUsername: () => {},
};

const LocalStateContext = createContext<StateInt>(stateContextDefaults);

interface PropsInt {
  children: ReactNode;
}

export function LocalStateProvider({ children }: PropsInt) {
  const [userId, setUserId] = useLocalStorage<number | null>('userId', null);
  const [email, setEmail] = useLocalStorage<string>('email', '');
  const [profileId, setProfileId] = useLocalStorage<number | null>('profileId', null);
  const [username, setUsername] = useLocalStorage<string>('username', '');

  const sharedState: StateInt = {
    userId,
    email,
    profileId,
    username,
    setUserId,
    setEmail,
    setProfileId,
    setUsername,
  };

  return <LocalStateContext.Provider value={sharedState}>{children}</LocalStateContext.Provider>;
}

export function useLocalState() {
  return useContext(LocalStateContext);
}
