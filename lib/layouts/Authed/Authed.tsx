import { ReactNode } from 'react';
import NavBar from './NavBar';
import cx from 'classnames';

interface PublicLayoutProps {
  children: ReactNode;
}

const AuthedLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      <div className={cx('container')}>{children}</div>
      <NavBar className={cx('navBar')} />
    </>
  );
};

export { AuthedLayout };
