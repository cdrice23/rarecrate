import Image from 'next/image';
import cx from 'classnames';
import { Archive, Tag, SquaresFour, UserCircle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface GlobalSearchResultProps {
  data: any;
  index: number;
  lastSlice?: number;
  getMoreItems?: () => void;
}

const GlobalSearchResult = ({ data, index, lastSlice, getMoreItems }: GlobalSearchResultProps) => {
  return (
    <motion.div
      className={cx('searchResult')}
      onViewportEnter={() => {
        if (index === lastSlice) {
          getMoreItems();
        }
      }}
    >
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
    </motion.div>
  );
};

export { GlobalSearchResult };
