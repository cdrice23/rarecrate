import { useState } from 'react';
import cx from 'classnames';
import { SocialPlatform } from '@/core/enums/database';
import {
  LinkSimpleHorizontal,
  TwitterLogo,
  InstagramLogo,
  SpotifyLogo,
  YoutubeLogo,
  VinylRecord,
} from '@phosphor-icons/react';
import OutsideClickHandler from 'react-outside-click-handler';
import Link from 'next/link';

interface SocialLinkButtonProps {
  socialLinks: [{ platform: SocialPlatform; username: string }];
}

const SocialLinkButton = ({ socialLinks }: SocialLinkButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getPlatformLogo = platform => {
    switch (platform) {
      case 'TWITTER':
        return <TwitterLogo />;
      case 'INSTAGRAM':
        return <InstagramLogo />;
      case 'SPOTIFY':
        return <SpotifyLogo />;
      case 'YOUTUBE':
        return <YoutubeLogo />;
      case 'DISCOGS':
        return <VinylRecord />;
      default:
        return null;
    }
  };

  const getPlatformUrl = (platform, username) => {
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

  return (
    <div className={cx('socialLinkButton')}>
      <button onClick={() => setIsOpen(!isOpen)}>
        <p>{`Social Links`}</p>
        <LinkSimpleHorizontal />
      </button>
      {isOpen && (
        <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
          <ul className={cx('socialLinkMenu')}>
            {socialLinks.map((link, index) => (
              <li
                key={index}
                className={cx('menuItem')}
                // onClick={() => console.log(`Navigate to ${link.platform} to user ${link.username}`)}
              >
                <a href={getPlatformUrl(link.platform, link.username)} target="_blank">
                  <div className={cx('platform')}>
                    {getPlatformLogo(link.platform)}
                    <p>{link.platform}</p>
                  </div>
                  <p className={cx('username')}>{link.username}</p>
                </a>
              </li>
            ))}
          </ul>
        </OutsideClickHandler>
      )}
    </div>
  );
};

export { SocialLinkButton };
