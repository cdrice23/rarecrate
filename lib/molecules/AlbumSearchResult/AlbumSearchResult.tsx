import cx from 'classnames';
import { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { motion } from 'framer-motion';
import { formatArtistName } from '@/core/helpers/cosmetic';

interface AlbumSearchResultProps {
  index: number;
  lastIndex: number;
  title: string;
  imageUrl: string;
  artist: string;
  lastSlice: number;
  handleDiscogsSearch: () => void;
  setCurrentPage: (value) => void;
}

const AlbumSearchResult = ({
  index,
  lastIndex,
  title,
  imageUrl,
  artist,
  lastSlice,
  handleDiscogsSearch,
  setCurrentPage,
}: AlbumSearchResultProps) => {
  const [src, setSrc] = useState<string | StaticImageData>('/grey_square.png');

  return (
    <motion.div
      className={cx('searchResult')}
      onViewportEnter={async () => {
        if (index === lastSlice) {
          setCurrentPage((lastSlice + 1) / 30 + 1);
        }
        if (index === lastIndex) {
          // console.log(`${title} is the last item!`);
          console.log(`You hit the last item!`);
          await handleDiscogsSearch();
        }
      }}
      onHoverStart={() => {
        setSrc(imageUrl);
      }}
      onHoverEnd={() => {
        setSrc('/grey_square.png');
      }}
    >
      <motion.div
        className={cx('albumCover')}
        animate={{
          opacity: src === '/grey_square.png' ? 0 : 1,
          transition: { duration: 0.3 },
        }}
      >
        <Image src={src} height={55} width={55} alt={title} />
      </motion.div>
      <div className={cx('description')}>
        <h3>{title}</h3>
        <p>{formatArtistName(artist)}</p>
      </div>
    </motion.div>
  );
};

export { AlbumSearchResult };
