import Link from 'next/link';
import { ReactNode } from 'react';
import cx from 'classnames';

interface LinkProps {
  href?: string | null;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const LinkButton = ({ href = '#', children, className, disabled, onClick }: LinkProps) => {
  return (
    <Link href={href} passHref>
      <button className={className} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    </Link>
  );
};

export default LinkButton;
