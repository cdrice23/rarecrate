import Link from 'next/link';
import { ReactNode } from 'react';
import cx from 'classnames';

interface LinkProps {
  href?: string | null;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const LinkButton = ({ href = '#', children, className, onClick }: LinkProps) => {
  return (
    <Link href={href} passHref>
      <button className={className} onClick={onClick}>
        {children}
      </button>
    </Link>
  );
};

export default LinkButton;
