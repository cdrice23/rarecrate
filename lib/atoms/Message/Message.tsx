import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { X } from '@phosphor-icons/react';
import { MessageProps } from '@/types/atoms/Message.types';

const Message = ({ title, content, footer, show, onClose }: MessageProps) => {
  return (
    <div className={cx('messageWrapper', { show: !!show })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className="message">
          <div className="message-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="close" type="button">
              <X />
            </button>
          </div>
          <div className="message-body">{content}</div>
          {footer && <div className="message-footer">{footer}</div>}
        </div>
      </OutsideClickHandler>
    </div>
  );
};

export { Message };
