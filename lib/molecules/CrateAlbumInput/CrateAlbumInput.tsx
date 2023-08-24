import cx from 'classnames';
import { X } from '@phosphor-icons/react';
import { TagSearchInput } from '../TagSearchInput/TagSearchInput';

interface CrateAlbumInputProps {
  id: number;
  data: any;
  removeHandler: () => void;
}

const CrateAlbumInput = ({ data, id, removeHandler }: CrateAlbumInputProps) => {
  return (
    <div className={cx('crateAlbumWrapper')}>
      <div className={cx('description')}>
        <h3>{data.title}</h3>
        <p>{data.artist}</p>
      </div>
      <TagSearchInput name={`crateAlbums.${id}.tags`} value={data.tags} />
      <button type="button" onClick={removeHandler} className={cx('closeButton')}>
        <X />
      </button>
    </div>
  );
};

export { CrateAlbumInput };
