import Link from 'next/link';
import { ReactNode } from 'react';

interface LinkProps {
  href?: string | null;
  children: ReactNode;
  className?: string;
}

const LinkButton = ({ href, children }: LinkProps) => {
  return (
    <Link href={href} passHref>
      <button>{children}</button>
    </Link>
  );
};

export default LinkButton;
