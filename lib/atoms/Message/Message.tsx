import { ReactNode } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import cx from 'classnames';
import { X } from '@phosphor-icons/react';

interface IMessage {
  title: string;
  content: ReactNode;
  footer?: ReactNode;
  show?: boolean;
  onClose(): void;
}

const Message = ({ title, content, footer, show, onClose }: IMessage) => {
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