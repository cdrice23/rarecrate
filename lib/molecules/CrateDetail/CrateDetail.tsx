import { Modal } from '@/lib/atoms/Modal/Modal';

type CrateDetailProps = {
  show?: boolean;
  onClose: () => void;
};

const CrateDetail = ({ show, onClose }: CrateDetailProps) => {
  return <Modal content={<div>{`I'm a modal!`}</div>} title="Modal Title" show={show} onClose={onClose} />;
};

export { CrateDetail };
