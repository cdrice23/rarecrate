import cx from 'classnames';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Archive, Tag, SquaresFour, UserCircle } from '@phosphor-icons/react';
import { formatArtistName } from '@/core/helpers/cosmetic';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import { GlobalSearchResultProps } from '@/lib/molecules/GlobalSearchResult/GlobalSearchResult.types';

const GlobalSearchResult = ({ data, index, lastSlice, getMoreItems }: GlobalSearchResultProps) => {
  console.log(data);
  return (
    <motion.div
      className={cx('searchResult')}
      onViewportEnter={() => {
        if (index === lastSlice && getMoreItems) {
          console.log('you hit the last item!');
          getMoreItems();
        }
      }}
    >
      <div className={cx('resultImage')}>
        {data.image && <ProfilePic username={data.username} size={40} />}
        {data.imageUrl && (
          <Image src={data.imageUrl} height={40} width={40} alt={data.title} className={cx('albumImage')} />
        )}
        {data.__typename === 'Profile' && !data.image && <UserCircle size={24} />}
        {data.__typename === 'Crate' && <Archive size={24} />}
        {(data.__typename === 'Label' || data.__typename === 'Tag') && <Tag size={24} />}
        {(data.__typename === 'Genre' || data.__typename === 'Subgenre') && <SquaresFour size={24} />}
      </div>
      <div className="resultText">
        {data.artist && <p>{formatArtistName(data.artist)}</p>}
        {(data.__typename === 'Label' ||
          data.__typename === 'Tag' ||
          data.__typename === 'Genre' ||
          data.__typename === 'Subgenre') && <p className={cx('resultType')}>{`${data.__typename}:`}</p>}
        <h3>{data.username || data.name || data.title || ''}</h3>
        {data.creator && <p>{`by ${data.creator.username}`}</p>}
      </div>
    </motion.div>
  );
};

export { GlobalSearchResult };
