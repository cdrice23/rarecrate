import { ReactNode } from 'react';

export interface MessageProps {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
  show?: boolean;
  onClose(): void;
}
