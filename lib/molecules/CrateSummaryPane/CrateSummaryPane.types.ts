import { Dispatch } from 'react';

export type CrateSummaryPaneProps = {
  currentItems: any[];
  username: string;
  mainProfile: number;
  userProfiles: [{ id: number; username: string }];
  getMoreItems: () => void;
  imageRefreshKey: number;
  dispatch: Dispatch<{ type: any; payload: any }>;
};
