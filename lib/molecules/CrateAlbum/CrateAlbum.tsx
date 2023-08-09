import { useState } from 'react';
import Image from 'next/image';
import cx from 'classnames';

type Genre = {
  id: number;
  name: string;
};

type TracklistItem = {
  id: number;
  order: number;
  title: string;
};

type AlbumData = {
  artist: string;
  genres: Genre[];
  subgenres: Genre[];
  imageUrl: string;
  label: string;
  releaseYear: number;
  title: string;
  tracklist: TracklistItem[];
};

type TagData = {
  id: number;
  name: string;
};

export type CrateAlbumData = {
  id: number;
  album: AlbumData;
  rank: number;
  tags: TagData[];
};

type CrateAlbumProps = {
  data: CrateAlbumData;
};

export const CrateAlbum = ({ data }: CrateAlbumProps) => {
  const [albumFace, setAlbumFace] = useState<'front' | 'back'>('front');

  const handleSwitch = () => setAlbumFace(prevState => (prevState === 'front' ? 'back' : 'front'));

  return (
    <button onClick={handleSwitch} className={cx('crateAlbum')}>
      {albumFace === 'front' ? <CrateAlbumFront data={data} /> : <CrateAlbumBack data={data} />}
    </button>
  );
};

const CrateAlbumFront = ({ data }: CrateAlbumProps) => {
  return (
    <>
      {data.rank > 0 && <div className={cx('rankBadge')}>{data.rank}</div>}
      <Image src={data.album.imageUrl} width={300} height={300} alt={data.album.title} />
    </>
  );
};

const CrateAlbumBack = ({ data }: CrateAlbumProps) => {
  return (
    <>
      <div className={cx('back')}>
        <p>Artist: {data.album.artist}</p>
        <p>Title: {data.album.title}</p>
        <p>Label: {data.album.label}</p>
        <p>Release Year: {data.album.releaseYear}</p>
        <p>{`Genres: ${data.album.genres.map(genre => genre.name).join(', ')}`}</p>
        <p>{`Subgenres: ${data.album.subgenres.map(subgenre => subgenre.name).join(', ')}`}</p>
        <p>{`Tags: ${data.tags.map(tag => tag.name).join(', ')}`}</p>
        <div className={cx('tracklist')}>
          <p>Tracklist: </p>
          <ol>
            {data.album.tracklist.map(track => (
              <li key={track.id}>{`${track.title}`}</li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
};
