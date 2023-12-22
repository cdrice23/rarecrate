import cx from 'classnames';
import { useScroll, useTransform, useSpring, motion, motionValue } from 'framer-motion';
import OutsideClickHandler from 'react-outside-click-handler';
import { CrateModalProps } from './CrateModal.types';

const CrateModal = ({ content, show, onClose }: CrateModalProps) => {
  const { scrollY } = useScroll();
  // const modalHeight = useTransform(scrollY, scrollValue => {
  //   if (scrollValue >= 300) {
  //     return '100px';
  //   } else {
  //     return 'auto';
  //   }
  // });
  const modalHeight = useTransform(scrollY, [0, 300], [250, 100]);

  return (
    <div className={cx('crateModalWrapper', { show: !!show })}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <motion.div className={cx('crateModal')} style={{ height: modalHeight }}>
          <div className={cx('crateHandle')} />
          <div className={cx('crateModalContent')}>{content}</div>
        </motion.div>
      </OutsideClickHandler>
    </div>
  );
};

export { CrateModal };
