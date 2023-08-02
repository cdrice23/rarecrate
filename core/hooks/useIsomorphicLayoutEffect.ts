// Workaround for using useLayoutEffect in SSR environments - uses useLayoutEffect in client browser, otherwise useEffect on serverSide

import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
