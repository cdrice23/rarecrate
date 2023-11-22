import cx from 'classnames';
import { PaneProps } from '@/types/atoms/Pane.types';

const Pane = ({ children, crateSummaryPane, crateDiggingPane }: PaneProps) => {
  return (
    <div
      className={cx('pane', {
        [`crateSummaryPane`]: crateSummaryPane,
        [`crateDiggingPane`]: crateDiggingPane,
      })}
    >
      {children}
    </div>
  );
};

export { Pane };
