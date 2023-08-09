import { useState, cloneElement, ReactElement } from 'react';

interface BinaryIconButtonProps {
  icon: ReactElement;
  checkStatus: boolean;
  handler?: () => void;
}

const BinaryIconButton = ({ icon, checkStatus, handler }: BinaryIconButtonProps) => {
  const [checked, setChecked] = useState<boolean>(checkStatus);

  const handleClick = event => {
    event.stopPropagation();
    setChecked(!checked);
    handler ? handler() : null;
  };

  return (
    <button onClick={handleClick}>{cloneElement(icon, { weight: checked ? 'fill' : 'regular', ...icon.props })}</button>
  );
};

export default BinaryIconButton;
