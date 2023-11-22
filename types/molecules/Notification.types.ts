export interface NotificationProps {
  index: number;
  notificationData: any;
  mainProfile: number;
  lastIndex: number;
  currentPage: number;
  getMoreNotifications: () => void;
  setCurrentPage: (value: (prevPage: number) => number) => void;
}
