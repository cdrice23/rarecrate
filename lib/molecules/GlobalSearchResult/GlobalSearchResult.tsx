import Image from 'next/image';
import cx from 'classnames';
import { Archive, Tag, SquaresFour, UserCircle } from '@phosphor-icons/react';

const GlobalSearchResult = ({ data }) => {
  return (
    <div className={cx('searchResult')}>
      <div className={cx('resultImage')}>
        {(data.image || data.imageUrl) && (
          <Image src={data.imageUrl} height={40} width={40} alt={data.title} className={cx('profileImage')} />
        )}
        {data.__typename === 'Profile' && !data.image && <UserCircle size={24} />}
        {data.__typename === 'Crate' && <Archive size={24} />}
        {data.__typename === ('Label' || 'Tag') && <Tag size={24} />}
        {data.__typename === ('Genre' || 'Subgenre') && <SquaresFour size={24} />}
      </div>
      <div className="resultText">
        {data.artist && <p>{data.artist}</p>}
        <h3>{data.username || data.name || data.title || ''}</h3>
      </div>
    </div>
  );
};

export { GlobalSearchResult };
