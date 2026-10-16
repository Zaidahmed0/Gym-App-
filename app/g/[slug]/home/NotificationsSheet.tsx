"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, CalendarClock, PartyPopper, Bell } from "lucide-react";
import Photo from "./Photo";
import type { FeedItem, Theme } from "./types";

function KindIcon({ kind, size = 18 }: { kind: string; size?: number }) {
  if (kind === "announcement") return <Megaphone size={size} />;
  if (kind === "expiry") return <CalendarClock size={size} />;
  if (kind === "welcome") return <PartyPopper size={size} />;
  return <Bell size={size} />;
}

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const LABELS: Record<string, string> = {
  announcement: "Announcement",
  expiry: "Membership",
  welcome: "Welcome",
};

type SheetProps = { theme: Theme; open: boolean; items: FeedItem[]; onClose: () => void };

export default function NotificationsSheet({ theme: t, open, items, onClose }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26 }}
            className="w-full max-w-md mx-auto max-h-[85vh] overflow-y-auto p-5 pb-8" onClick={(e) => e.stopPropagation()}
            style={{ background: t.bg, borderTopLeftRadius: t.radius, borderTopRightRadius: t.radius }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <div className="flex justify-between items-center">
              <p className="text-3xl leading-none">Inbox</p>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center" style={{ background: t.card, borderRadius: t.pill }} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {items.length === 0 && <p className="text-center text-sm text-gray-500 py-10">Nothing here yet.</p>}
              {items.map((item) => (
                <div key={item.id} className="overflow-hidden" style={{ background: t.card, borderRadius: t.radius, outline: item.unread ? `1.5px solid ${t.accent}` : "none" }}>
                  {item.image_url && <Photo src={item.image_url} className="w-full h-44 object-cover" />}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color: t.accent }}>
                      <KindIcon kind={item.kind} size={14} />
                      <span>{LABELS[item.kind] || "Update"}</span>
                      <span className="text-gray-500">· {timeAgo(item.created_at)}</span>
                      {item.unread && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: t.accent }} />}
                    </div>
                    <p className="mt-2 text-lg leading-snug">{item.title}</p>
                    {item.body && <p className="mt-1 text-sm text-gray-400 whitespace-pre-line">{item.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type PopupProps = { theme: Theme; item: FeedItem | null; onClose: () => void };

export function AnnouncementPopup({ theme: t, item, onClose }: PopupProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] bg-black/80 flex items-center justify-center p-5" onClick={onClose}>
          <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }} className="w-full max-w-sm overflow-hidden"
            style={{ background: t.card, borderRadius: t.radius }} onClick={(e) => e.stopPropagation()}>
            {item.image_url ? (
              <Photo src={item.image_url} className="w-full h-56 object-cover" />
            ) : (
              <div className="h-28 flex items-center justify-center" style={{ background: t.accent, color: t.onAccent }}>
                <KindIcon kind={item.kind} size={44} />
              </div>
            )}
            <div className="p-5">
              <span className="text-xs px-3 py-1 inline-flex items-center gap-1.5" style={{ background: `${t.accent}22`, color: t.accent, borderRadius: t.pill }}>
                <KindIcon kind={item.kind} size={12} /> {LABELS[item.kind] || "Update"}
              </span>
              <p className="mt-3 text-2xl leading-tight">{item.title}</p>
              {item.body && <p className="mt-2 text-sm text-gray-300 whitespace-pre-line">{item.body}</p>}
              <button onClick={onClose} className="mt-5 w-full py-3" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
                Let&apos;s go
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}