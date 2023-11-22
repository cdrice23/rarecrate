import cx from 'classnames';
import { PublicLayoutProps } from '@/types/layouts/Public.types';

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      <div className={cx('wrapper')}>{children}</div>
    </>
  );
};

export { PublicLayout };
