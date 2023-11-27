import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { X } from '@phosphor-icons/react';
import { ModalProps } from '@/lib/atoms/Modal/Modal.types';

const Modal = ({ title, content, footer, show, onClose }: ModalProps) => {
  return (
    <div className={cx('modalWrapper', { show: !!show })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className="modal">
          <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="close" type="button">
              <X />
            </button>
          </div>
          <div className="modal-body">{content}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </OutsideClickHandler>
    </div>
  );
};

export { Modal };
