import { createElement, ReactElement } from 'react';
import { TwitterLogo, InstagramLogo, SpotifyLogo, YoutubeLogo, VinylRecord } from '@phosphor-icons/react';

export const getPlatformLogo = (platform): ReactElement | null => {
  switch (platform) {
    case 'TWITTER':
      return createElement(TwitterLogo);
    case 'INSTAGRAM':
      return createElement(InstagramLogo);
    case 'SPOTIFY':
      return createElement(SpotifyLogo);
    case 'YOUTUBE':
      return createElement(YoutubeLogo);
    case 'DISCOGS':
      return createElement(VinylRecord);
    default:
      return null;
  }
};

export const getPlatformUrl = (platform, username) => {
  switch (platform) {
    case 'TWITTER':
      return `https://twitter.com/${username}`;
    case 'INSTAGRAM':
      return `https://www.instagram.com/${username}`;
    case 'SPOTIFY':
      return `https://open.spotify.com/user/${username}`;
    case 'YOUTUBE':
      return `https://www.youtube.com/user/${username}`;
    case 'DISCOGS':
      return `https://www.discogs.com/user/${username}`;
    default:
      return '';
  }
};
