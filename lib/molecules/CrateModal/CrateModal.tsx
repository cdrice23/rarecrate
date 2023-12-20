import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { CrateModalProps } from './CrateModal.types';

const CrateModal = ({ content, show, onClose }: CrateModalProps) => {
  return (
    <div className={cx('crateModalWrapper', { show: !!show })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className="crateModal">{content}</div>
      </OutsideClickHandler>
    </div>
  );
};

export { CrateModal };
