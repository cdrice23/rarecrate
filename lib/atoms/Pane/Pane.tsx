import React, { ReactNode } from 'react';

type PaneProps = {
  children: ReactNode;
};

const Pane = ({ children }: PaneProps) => {
  return <div className="pane">{children}</div>;
};

export { Pane };
