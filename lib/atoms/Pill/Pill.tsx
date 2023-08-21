import { X } from '@phosphor-icons/react';
import cx from 'classnames';

interface PillProps {
  name: string;
  removeHandler: () => void;
}

const Pill = ({ name, removeHandler }: PillProps) => {
  return (
    <div className={cx('pill')}>
      <p className={cx('pillName')}>{name}</p>
      <button onClick={removeHandler} type="button">
        <X />
      </button>
    </div>
  );
};

export { Pill };
