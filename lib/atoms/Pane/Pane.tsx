import React, { ReactNode } from 'react';
import cx from 'classnames';

type PaneProps = {
  children: ReactNode;
  crateSummaryPane?: boolean;
};

const Pane = ({ children, crateSummaryPane }: PaneProps) => {
  return (
    <div
      className={cx('pane', {
        [`crateSummaryPane`]: crateSummaryPane,
      })}
    >
      {children}
    </div>
  );
};

export { Pane };
