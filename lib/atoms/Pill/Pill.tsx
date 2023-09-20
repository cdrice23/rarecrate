import { X } from '@phosphor-icons/react';
import cx from 'classnames';

interface PillProps {
  name: string;
  icon?: React.ReactNode;
  removeHandler?: () => void;
}

const Pill = ({ name, removeHandler, icon }: PillProps) => {
  return (
    <div className={cx('pill')}>
      {<div className={cx('pillIcon')}>{icon}</div>}
      <p className={cx('pillName')}>{name}</p>
      {removeHandler && (
        <button onClick={removeHandler} type="button">
          <X />
        </button>
      )}
    </div>
  );
};

export { Pill };
