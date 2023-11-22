import { ReactNode } from 'react';

export interface AuthedLayoutProps {
  children: ReactNode;
  userProfiles: any[];
}

export interface NavBarProps {
  className: string;
  disableNav: boolean;
}
