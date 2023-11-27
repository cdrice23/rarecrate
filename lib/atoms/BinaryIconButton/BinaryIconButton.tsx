import { useState, cloneElement } from 'react';
import { BinaryIconButtonProps } from '@/lib/atoms/BinaryIconButton/BinaryIconButton.types';

const BinaryIconButton = ({ icon, checkStatus, handler }: BinaryIconButtonProps) => {
  const [checked, setChecked] = useState<boolean>(checkStatus);

  const handleClick = event => {
    event.stopPropagation();
    setChecked(!checked);
    handler ? handler(checked) : null;
  };

  return (
    <button onClick={event => handleClick(event)}>
      {cloneElement(icon, { weight: checkStatus ? 'fill' : 'regular', ...icon.props })}
    </button>
  );
};

export default BinaryIconButton;
