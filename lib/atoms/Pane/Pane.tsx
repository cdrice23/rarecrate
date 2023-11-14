import cx from 'classnames';
import { ReactNode } from 'react';

type PaneProps = {
  children: ReactNode;
  crateSummaryPane?: boolean;
  crateDiggingPane?: boolean;
};

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
