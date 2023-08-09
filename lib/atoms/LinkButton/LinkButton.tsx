import Link from 'next/link';
import { ReactNode } from 'react';
import cx from 'classnames';

interface LinkProps {
  href?: string | null;
  children: ReactNode;
  className?: string;
}

const LinkButton = ({ href, children, className }: LinkProps) => {
  return (
    <Link href={href} passHref>
      <button className={className}>{children}</button>
    </Link>
  );
};

export default LinkButton;
