import { ReactElement } from 'react';

export interface BinaryIconButtonProps {
  icon: ReactElement;
  checkStatus: boolean;
  handler?: (...args) => void;
}
