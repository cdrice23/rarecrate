import { ReactNode } from 'react';
import styles from './Public.module.scss';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      <div className={styles.wrapper}>{children}</div>
    </>
  );
};

export { PublicLayout };
