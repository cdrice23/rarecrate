import { NextRouter } from 'next/router';
import { Route } from '@/core/enums/routes';

export const handleActionOwnerNav = (router: NextRouter, username: string) => {
  const actionOwnerPath = Route.Profile + `/${username}`;
  router.push({
    pathname: actionOwnerPath,
  });
};

export const handleConnectedCrateNav = (router: NextRouter, username: string, crateId: string) => {
  router.push({
    pathname: Route.Profile + `/${username}`,
    query: {
      selectedCrate: crateId,
    },
  });
};

export const handleConnectedProfile = (router: NextRouter, username: string) => {
  router.push({
    pathname: Route.Profile + `/${username}`,
  });
};

export const calculateTime = (createdDate: string) => {
  const currentDate = new Date();
  const createdDateTime = new Date(createdDate);
  const diffTime = Math.abs(currentDate.valueOf() - createdDateTime.valueOf());

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  return { diffDays, diffHours, diffMinutes };
};

export const displayTime = ({
  diffDays,
  diffHours,
  diffMinutes,
}: {
  diffDays: number;
  diffHours: number;
  diffMinutes: number;
}) => {
  if (diffDays >= 7) {
    const weeks = Math.ceil(diffDays / 7);
    return `${weeks}w`;
  } else if (diffDays > 0) {
    return `${diffDays}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minutes ago`;
  } else {
    return 'just now';
  }
};
