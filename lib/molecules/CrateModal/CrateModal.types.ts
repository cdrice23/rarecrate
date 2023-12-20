import { ReactNode } from 'react';

export interface CrateModalProps {
  content: ReactNode;
  show?: boolean;
  onClose(): void;
}
