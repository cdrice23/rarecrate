import cx from 'classnames';
import { X } from '@phosphor-icons/react';

interface CrateAlbumInputProps {
  data: any;
  removeHandler: () => void;
  tagHandler: (tag: string) => void;
}

const CrateAlbumInput = ({ data, removeHandler, tagHandler }: CrateAlbumInputProps) => {
  return (
    <div className={cx('crateAlbumWrapper')}>
      <div className={cx('description')}>
        <h3>{data.title}</h3>
        <p>{data.artist}</p>
        <input placeholder={'Tags'} onChange={e => tagHandler(e.target.value)} />
      </div>
      <button type="button" onClick={removeHandler}>
        <X />
      </button>
    </div>
  );
};

export { CrateAlbumInput };
