export type Genre = {
  id: number;
  name: string;
};

export type TracklistItem = {
  id: number;
  order: number;
  title: string;
};

export type AlbumData = {
  artist: string;
  genres: Genre[];
  subgenres: Genre[];
  imageUrl: string;
  label: string;
  releaseYear: number;
  title: string;
  tracklist: TracklistItem[];
  discogsMasterId: number;
};

export type TagData = {
  id: number;
  name: string;
};

export type CrateAlbumData = {
  id: number;
  album: AlbumData;
  rank: number;
  tags: TagData[];
};

export interface CrateAlbumProps {
  data: CrateAlbumData;
}
