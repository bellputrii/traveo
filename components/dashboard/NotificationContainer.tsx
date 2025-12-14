'use client';

import { useAppSelector } from '../../store/hooks';
import Notification from './Notification';

export default function NotificationContainer() {
  const { notifications } = useAppSelector((state) => state.categories);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />
      ))}
    </div>
  );
}