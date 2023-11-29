import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState } from 'react';
import { LinkSimpleHorizontal } from '@phosphor-icons/react';
import { SocialLinkButtonProps } from '@/lib/molecules/SocialLinkButton/SocialLinkButton.types';
import { getPlatformLogo, getPlatformUrl } from './SocialLinkButton.helpers';

const SocialLinkButton = ({ socialLinks }: SocialLinkButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
              <li key={index} className={cx('menuItem')}>
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
