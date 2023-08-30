import { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { motion } from 'framer-motion';
import greySquareImage from '@/core/constants/placeholders/grey_square.png';
import cx from 'classnames';

interface AlbumSearchResultProps {
  index: number;
  lastIndex: number;
  title: string;
  imageUrl: string;
  artist: string;
}

const AlbumSearchResult = ({ index, lastIndex, title, imageUrl, artist }: AlbumSearchResultProps) => {
  const [src, setSrc] = useState<string | StaticImageData>(greySquareImage);

  return (
    <motion.div
      className={cx('searchResult')}
      onViewportEnter={() => {
        if (index === lastIndex) {
          console.log(`${title} is the last item!`);
        }
      }}
      onHoverStart={() => {
        setSrc(imageUrl);
      }}
      onHoverEnd={() => {
        setSrc(greySquareImage);
      }}
    >
      <motion.div
        className={cx('albumCover')}
        animate={{
          opacity: src === greySquareImage ? 0 : 1,
          transition: { duration: 0.3 },
        }}
      >
        <Image src={src} height={55} width={55} alt={title} />
      </motion.div>
      <div className={cx('description')}>
        <h3>{title}</h3>
        <p>{artist}</p>
      </div>
    </motion.div>
  );
};

export { AlbumSearchResult };
