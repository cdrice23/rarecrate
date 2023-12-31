import cx from 'classnames';
import Image from 'next/image';
import { useState } from 'react';
import { formatArtistName } from '@/core/helpers/cosmetic';
import { CrateAlbumProps } from '@/lib/molecules/CrateAlbum/CrateAlbum.types';
import { ExternalLinkDropdownButton } from '../ExternalLinkDropdownButton/ExternalLinkDropdownButton';

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
        <ExternalLinkDropdownButton
          albumArtist={formatArtistName(data.album.artist)}
          albumTitle={data.album.title}
          discogsMasterId={data.album.discogsMasterId}
        />
        <p>Artist: {data.album.artist}</p>
        <p>Title: {formatArtistName(data.album.title)}</p>
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
