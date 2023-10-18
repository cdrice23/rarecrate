import React, { ReactNode } from 'react';
import cx from 'classnames';

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
