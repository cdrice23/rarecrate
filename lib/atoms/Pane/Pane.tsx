import cx from 'classnames';
import { PaneProps } from '@/lib/atoms/Pane/Pane.types';

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
