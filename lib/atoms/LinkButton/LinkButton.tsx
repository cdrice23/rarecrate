import Link from 'next/link';
import { ReactNode } from 'react';

interface LinkProps {
  href: string;
  children: ReactNode;
}

const LinkButton = ({ href, children }: LinkProps) => {
  return (
    <Link href={href} passHref>
      {children}
    </Link>
  );
};

export default LinkButton;
