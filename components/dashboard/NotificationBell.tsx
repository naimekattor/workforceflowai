"use client";

import { Bell, WifiOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  getNotificationWebSocketUrl,
  getNotifications,
  markNotificationRead,
  Notification,
} from "@/lib/api/notifications";

type SocketMessage = {
  notification?: unknown;
  message?: unknown;
  id?: unknown;
  user?: unknown;
  is_read?: unknown;
  created_at?: unknown;
};

function isNotification(value: unknown): value is Notification {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Notification>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.message === "string" &&
    typeof candidate.is_read === "boolean" &&
    typeof candidate.created_at === "string"
  );
}

function notificationFromSocketMessage(value: unknown): Notification | null {
  if (isNotification(value)) return value;

  if (!value || typeof value !== "object") return null;

  const message = value as SocketMessage;
  if (isNotification(message.notification)) return message.notification;
  if (isNotification(message.message)) return message.message;

  if (
    typeof message.id === "number" &&
    typeof message.message === "string" &&
    typeof message.created_at === "string"
  ) {
    return {
      id: message.id,
      user: typeof message.user === "number" ? message.user : 0,
      message: message.message,
      is_read: typeof message.is_read === "boolean" ? message.is_read : false,
      created_at: message.created_at,
    };
  }

  return null;
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function NotificationBell() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [isOpen, setIsOpen] = useState(false);
  const [realtimeState, setRealtimeState] = useState<{
    token: string | null;
    connected: boolean;
  }>({ token: null, connected: false });
  const [notificationState, setNotificationState] = useState<{
    token: string | null;
    items: Notification[];
  }>({ token: null, items: [] });

  const notifications = useMemo(
    () =>
      notificationState.token === accessToken ? notificationState.items : [],
    [accessToken, notificationState.items, notificationState.token]
  );
  const isRealtimeConnected =
    realtimeState.token === accessToken && realtimeState.connected;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const handleMarkRead = async (notification: Notification) => {
    if (notification.is_read) return;

    setNotificationState((current) => ({
      token: current.token,
      items: current.items.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      ),
    }));

    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotificationState((current) => ({
        token: current.token,
        items: current.items.map((item) =>
          item.id === notification.id ? { ...item, is_read: false } : item
        ),
      }));
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!accessToken) return;

    getNotifications()
      .then((response) => {
        if (isMounted) {
          setNotificationState({
            token: accessToken,
            items: response.results,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotificationState({
            token: accessToken,
            items: [],
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = new WebSocket(getNotificationWebSocketUrl(accessToken));

    socket.addEventListener("open", () => {
      setRealtimeState({ token: accessToken, connected: true });
    });

    socket.addEventListener("close", () => {
      setRealtimeState({ token: accessToken, connected: false });
    });

    socket.addEventListener("error", () => {
      setRealtimeState({ token: accessToken, connected: false });
    });

    socket.addEventListener("message", (event) => {
      try {
        const notification = notificationFromSocketMessage(
          JSON.parse(event.data as string)
        );

        if (!notification) return;

        setNotificationState((current) => ({
          token: accessToken,
          items: [
            notification,
            ...(current.token === accessToken ? current.items : []).filter(
              (item) => item.id !== notification.id
            ),
          ],
        }));
      } catch {
        // Ignore malformed websocket payloads.
      }
    });

    return () => {
      socket.close();
    };
  }, [accessToken]);

  if (!accessToken) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60 sm:w-80">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
            {!isRealtimeConnected && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <WifiOff className="h-3.5 w-3.5" />
                Offline
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkRead(notification)}
                  className={`border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                    notification.is_read ? "bg-white" : "bg-cyan-50/60"
                  } block w-full text-left transition-colors hover:bg-slate-50`}
                >
                  <p className="text-sm font-medium text-slate-800">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
