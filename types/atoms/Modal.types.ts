import { ReactNode } from 'react';

export interface ModalProps {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
  show?: boolean;
  onClose(): void;
}
