import { ReactNode } from 'react';
import cx from 'classnames';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      <div className={cx('wrapper')}>{children}</div>
    </>
  );
};

export { PublicLayout };
