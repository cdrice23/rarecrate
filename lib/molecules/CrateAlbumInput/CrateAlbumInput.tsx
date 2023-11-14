import cx from 'classnames';
import Image from 'next/image';
import { useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { formatArtistName } from '@/core/helpers/cosmetic';
import { TagSearchInput } from '../TagSearchInput/TagSearchInput';

interface CrateAlbumInputProps {
  id: number;
  data: any;
  removeHandler: () => void;
  initialRank?: number;
  setFieldValue: (name, value) => void;
  isRanked: boolean;
}

const CrateAlbumInput = ({ data, id, removeHandler, initialRank, setFieldValue, isRanked }: CrateAlbumInputProps) => {
  useEffect(() => {
    // if (!initialRank && data.order === 0) {
    setFieldValue(`crateAlbums.${id}.order`, Number(initialRank));
    setFieldValue(`crateAlbums.${id}.isRanked`, isRanked);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRanked]);
  // }, []);

  return (
    <div className={cx('crateAlbumWrapper')}>
      {initialRank && (
        <div className={cx('albumRank')}>
          <input
            name={`crateAlbums.${id}.order`}
            placeholder="Rank"
            type="number"
            min={0}
            value={data.order ?? initialRank}
            onChange={event => {
              setFieldValue(`crateAlbums.${id}.order`, Number(event.currentTarget.value));
            }}
          />
        </div>
      )}
      <div>
        <Image src={data.imageUrl} height={55} width={55} alt={data.title} className={cx('albumCover')} />
      </div>
      <div className={cx('description')}>
        <h3>{data.title}</h3>
        <p>{formatArtistName(data.artist)}</p>
      </div>
      <TagSearchInput name={`crateAlbums.${id}.tags`} value={data.tags ?? []} />
      <button type="button" onClick={removeHandler} className={cx('closeButton')}>
        <X />
      </button>
    </div>
  );
};

export { CrateAlbumInput };
