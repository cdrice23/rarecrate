import Link from 'next/link';
import { ReactNode } from 'react';

interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const LinkButton = ({ href, children, onClick }: LinkProps) => {
  return (
    <Link href={href} passHref>
      <button onClick={onClick}>{children}</button>
    </Link>
  );
};

export default LinkButton;
