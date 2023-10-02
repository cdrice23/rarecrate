import { ReactNode } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import cx from 'classnames';
import { X } from '@phosphor-icons/react';

interface IModal {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
  show?: boolean;
  onClose(): void;
}

const Modal = ({ title, content, footer, show, onClose }: IModal) => {
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
