export type ProfilePaneProps = {
  username: string;
  mainProfile: number;
  currentUser: number;
  userProfiles: [{ id: number; username: string }];
  handlePaneSelect: (pane: 'followers' | 'following' | 'crates' | 'favorites') => void;
  imageRefreshKey: number;
  setImageRefreshKey: (value: number) => void;
};
