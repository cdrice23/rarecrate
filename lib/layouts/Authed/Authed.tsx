import { ReactNode } from 'react';
import styles from './Authed.module.scss';

interface PublicLayoutProps {
  children: ReactNode;
}

const AuthedLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      <div className={styles.wrapper}>{children}</div>
    </>
  );
};

export { AuthedLayout };
