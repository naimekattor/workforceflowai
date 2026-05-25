"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  getNotifications,
  markNotificationRead,
  Notification,
} from "@/lib/api/notifications";

function getActivityType(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("customer")) return "Customer activity";
  if (normalizedMessage.includes("quote")) return "Quote activity";
  if (normalizedMessage.includes("invoice")) return "Invoice activity";
  if (normalizedMessage.includes("job")) return "Job activity";

  return "System activity";
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      date: "",
      time: "",
    };
  }

  return {
    date: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function ActivityRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (notification: Notification) => void;
}) {
  const activityTime = formatActivityTime(notification.created_at);

  return (
    <button
      type="button"
      onClick={() => onMarkRead(notification)}
      className="flex w-full items-start gap-4 rounded-xl border border-slate-100 bg-white p-5 text-left transition-all hover:border-slate-200 hover:shadow-sm"
    >
      <div className="mt-1">
        {notification.is_read ? (
          <CheckCircle2 className="h-5 w-5 text-slate-400" />
        ) : (
          <Bell className="h-5 w-5 text-[#22d3ee]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${
              notification.is_read
                ? "bg-slate-100 text-slate-700"
                : "bg-cyan-100 text-cyan-700"
            }`}
          >
            {getActivityType(notification.message)}
          </span>
        </div>
        <h3 className="mb-1 text-[14px] font-bold text-slate-900">
          {notification.message}
        </h3>
        <p className="text-[12px] text-slate-500">
          System / {activityTime.date} / {activityTime.time}
        </p>
      </div>
    </button>
  );
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-5"
        >
          <div className="mt-1 h-5 w-5 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-44 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function Activity() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const handleMarkRead = async (notification: Notification) => {
    if (notification.is_read) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    );

    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: false } : item
        )
      );
      setError("Failed to mark notification as read.");
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    let isMounted = true;

    const fetchActivity = async () => {
      if (!session?.accessToken) {
        if (isMounted) {
          setNotifications([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        setError("");
        setIsLoading(true);
        const response = await getNotifications();

        if (isMounted) {
          setNotifications(response.results);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
          setError("Failed to load activity log.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchActivity();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, status]);

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-slate-900">
            Activity Log
          </h1>
          <p className="text-sm text-slate-500">
            Track notification activity and system changes
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600">
            {notifications.length} total
          </span>
          <span className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 font-medium text-cyan-700">
            {unreadCount} unread
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <LoadingRows />
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <ActivityRow
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))
          ) : (
            <div className="rounded-xl border border-slate-100 bg-white p-8 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                No activity yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                New notifications will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
