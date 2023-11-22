import { ReactNode } from 'react';

export interface LinkButtonProps {
  href?: string | null;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}
