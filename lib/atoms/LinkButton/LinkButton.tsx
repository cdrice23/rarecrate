import Link from 'next/link';
import { LinkButtonProps } from '@/lib/atoms/LinkButton/LinkButton.types';

const LinkButton = ({ href = '#', children, className, disabled, onClick }: LinkButtonProps) => {
  return (
    <Link href={href} passHref>
      <button onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    </Link>
  );
};

export default LinkButton;
