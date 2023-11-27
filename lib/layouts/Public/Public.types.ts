import { ReactNode } from 'react';

export interface HeaderProps {
  isAuth?: boolean;
  children?: ReactNode;
}

export interface PublicLayoutProps {
  children: ReactNode;
}
