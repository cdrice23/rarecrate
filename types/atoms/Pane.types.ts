import { ReactNode } from 'react';

export type PaneProps = {
  children: ReactNode;
  crateSummaryPane?: boolean;
  crateDiggingPane?: boolean;
};
