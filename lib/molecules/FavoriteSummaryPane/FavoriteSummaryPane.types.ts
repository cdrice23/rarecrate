import { Dispatch } from 'react';

export type FavoriteSummaryPaneProps = {
  currentItems: any[];
  username: string;
  mainProfile: number;
  userProfiles: [{ id: number; username: string }];
  getMoreItems: () => void;
  dispatch: Dispatch<{ type: any; payload: any }>;
};
