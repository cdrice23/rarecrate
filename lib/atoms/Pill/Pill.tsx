import cx from 'classnames';
import { X } from '@phosphor-icons/react';

interface PillProps {
  name: string;
  icon?: React.ReactNode;
  removeHandler?: () => void;
  style?: string;
}

const Pill = ({ name, removeHandler, icon, style }: PillProps) => {
  return (
    <div className={cx('pill', style)}>
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
