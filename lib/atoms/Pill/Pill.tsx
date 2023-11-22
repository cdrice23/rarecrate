import cx from 'classnames';
import { X } from '@phosphor-icons/react';
import { PillProps } from '@/types/atoms/Pill.types';

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
