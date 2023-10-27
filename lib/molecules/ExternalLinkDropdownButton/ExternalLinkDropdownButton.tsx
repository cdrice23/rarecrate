import { useState } from 'react';
import cx from 'classnames';
import { Headphones, VinylRecord, SpotifyLogo, AppleLogo } from '@phosphor-icons/react';
import {
  getSpotifyAlbumUrlFromSearch,
  getAppleMusicUrlFromSearch,
  getDiscogsMasterUrl,
} from '@/core/helpers/externalLink';

const ExternalLinkDropdownButton = ({ albumArtist, albumTitle, discogsMasterId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getPlatformUrl = platform => {
    switch (platform) {
      case 'SPOTIFY':
        return getSpotifyAlbumUrlFromSearch(albumArtist, albumTitle);
      case 'APPLE':
        return getAppleMusicUrlFromSearch(albumArtist, albumTitle);
      case 'DISCOGS':
        return getDiscogsMasterUrl(discogsMasterId);
      default:
        return '';
    }
  };

  return (
    <div className={cx('externalLinkButton')}>
      <div
        onClick={event => {
          event.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <Headphones />
        {` / `}
        <VinylRecord />
      </div>
      {isOpen && (
        <ul className={cx('externalLinkMenu')}>
          <li className={cx('menuItem')}>
            <a href={getPlatformUrl('SPOTIFY')} target="_blank" onClick={event => event.stopPropagation()}>
              <div
                className={cx('platform')}
                // onClick={event => {
                //   event.stopPropagation();
                //   console.log('Opening album on spotify');
                // }}
              >
                <SpotifyLogo />
                <p>Listen on Spotify</p>
              </div>
            </a>
          </li>
          <li className={cx('menuItem')}>
            <a href={getPlatformUrl('APPLE')} target="_blank" onClick={event => event.stopPropagation()}>
              <div
                className={cx('platform')}
                // onClick={event => {
                //   event.stopPropagation();
                //   console.log('Opening album on apple music');
                // }}
              >
                <AppleLogo />
                <p>Listen on Apple Music</p>
              </div>
            </a>
          </li>
          <li className={cx('menuItem')}>
            <a href={getPlatformUrl('DISCOGS')} target="_blank" onClick={event => event.stopPropagation()}>
              <div
                className={cx('platform')}
                // onClick={event => {
                //   event.stopPropagation();
                //   console.log('Opening album on discogs');
                // }}
              >
                <VinylRecord />
                <p>Find/Buy on Discogs</p>
              </div>
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export { ExternalLinkDropdownButton };
