import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/auth/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Could not load notifications");
        setItems(body.notifications || []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const loadTask = window.setTimeout(loadNotifications, 0);
    return () => window.clearTimeout(loadTask);
  }, [loadNotifications]);

  async function markRead(id: string) {
    await fetch(`/api/auth/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#edf5fb] px-4 py-8 text-[#12304a] sm:px-8">
      <div className="mx-auto max-w-[900px]">
        <header className="flex items-center justify-between rounded-[28px] bg-white/85 px-5 py-4 shadow-[0_16px_35px_rgba(18,48,74,0.08)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid size-10 place-items-center rounded-full border border-[#dfeaf6] bg-white shadow-sm"
            aria-label="Back"
          >
            <i className="bi bi-arrow-left" />
          </button>
          <h1 className="text-2xl font-black tracking-[-0.05em]">
            Notifications
          </h1>
          <button
            type="button"
            onClick={loadNotifications}
            className="grid size-10 place-items-center rounded-full border border-[#dfeaf6] bg-white shadow-sm"
            aria-label="Refresh notifications"
          >
            <i className="bi bi-arrow-clockwise" />
          </button>
        </header>
        <section className="mt-6 rounded-[28px] border border-[#dfeaf6] bg-white p-6 shadow-[0_24px_60px_rgba(18,48,74,0.08)] sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                Account alerts
              </p>
              <h2 className="mt-2 text-3xl font-black">Your updates</h2>
            </div>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-black text-[#2f68f1]">
              {items.filter((item) => !item.is_read).length} unread
            </span>
          </div>
          {loading ? (
            <p className="mt-10 text-center font-bold text-[#647b8b]">
              Loading notifications...
            </p>
          ) : error ? (
            <p className="mt-8 rounded-xl bg-[#fff3f3] p-4 text-sm font-semibold text-[#a63636]">
              {error}
            </p>
          ) : items.length === 0 ? (
            <div className="mt-10 rounded-[22px] border border-dashed border-[#cbdbea] p-8 text-center">
              <i className="bi bi-bell-slash text-3xl text-[#2f68f1]" />
              <p className="mt-3 font-black">No notifications yet</p>
              <p className="mt-2 text-sm text-[#647b8b]">
                New account and review updates will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-[20px] border p-5 ${item.is_read ? "border-[#e5edf4] bg-[#fbfdff]" : "border-[#cfe0f8] bg-[#eef4ff]"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#526b82]">
                        {item.message}
                      </p>
                      <p className="mt-3 text-xs font-bold text-[#8aa0b2]">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        className="shrink-0 rounded-full bg-[#12304a] px-3 py-2 text-xs font-black text-white"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default NotificationsPage;
