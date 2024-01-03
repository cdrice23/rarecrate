import cx from 'classnames';
import { useState, useEffect, useRef } from 'react';
import { useScroll, useTransform, useSpring, motion, motionValue } from 'framer-motion';
import OutsideClickHandler from 'react-outside-click-handler';
import { CrateModalProps } from './CrateModal.types';
import crateDetailSample from '@/core/fixtures/crateDetail';

const containerStyle = {
  hidden: { opacity: 0, y: -20, width: '250px', height: '250px', background: 'white', color: 'black' },
  show: { opacity: 1, y: 0, width: '250px', height: '250px', background: 'white', color: 'black' },
};

const CrateModal = ({ content, show, onClose }: CrateModalProps) => {
  const [topItemIndex, setTopItemIndex] = useState(0);
  const topItemIndexRef = useRef(0);
  const { scrollY } = useScroll();

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    const crateModalElement = document.querySelector('.crateModal');
    if (crateModalElement) {
      observer.observe(crateModalElement);
      console.log(width);
    }

    return () => {
      if (crateModalElement) {
        observer.unobserve(crateModalElement);
      }
    };
  }, [width]);

  useEffect(() => {
    topItemIndexRef.current = topItemIndex;
  }, [topItemIndex]);

  const modalHeight = useTransform(scrollY, [0, 300], [width ?? 250, 100]);

  return (
    <>
      <div className={cx('crateOverlay', { show: !!show })}></div>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={cx('crateModalWrapper', { show: !!show })} style={{ height: `90vh`, width: width }}>
          <div className={cx('albumWrapper')} style={{ height: `calc(90vh - ${width})` }}>
            {crateDetailSample.albums.map((album, index) => (
              <motion.div
                key={album.id}
                className={cx('crateAlbum')}
                // initial="hidden"
                // animate={index === topItemIndex ? 'show' : 'hidden'}
                // variants={containerStyle}
                // viewport={{ once: true, amount: 0.8 }}
                style={{
                  zIndex: index + 100,
                  height: width,
                  width: width,
                }}
              >
                {`album ${album.rank}`}
              </motion.div>
            ))}
          </div>
          <motion.div className={cx('crateModal')} style={{ height: modalHeight }}>
            <div className={cx('crateHandle')} />
            <div className={cx('crateModalContent')}>{/* {content} */}</div>
          </motion.div>
        </div>
      </OutsideClickHandler>
    </>
  );
};

export { CrateModal };
