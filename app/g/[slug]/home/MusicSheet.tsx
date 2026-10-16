"use client";

import { useEffect, useState } from "react";
import { Music, X, ExternalLink, Plus, Trash2 } from "lucide-react";
import { spotifyEmbed, type Theme } from "./types";

type Props = {
  theme: Theme;
  url: string | null;
  open: boolean;
  onClose: () => void;
  onSave: (url: string | null) => void;
};

type Saved = { name: string; url: string };

const STORE_KEY = "saved-playlists";

export default function MusicSheet({ theme: t, url, open, onClose, onSave }: Props) {
  const [saved, setSaved] = useState<Saved[]>([]);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [err, setErr] = useState("");
  const embed = spotifyEmbed(url);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]") as Saved[];
      if (url && !list.some((p) => p.url === url)) list.unshift({ name: "My playlist", url });
      setSaved(list);
    } catch {
      setSaved(url ? [{ name: "My playlist", url }] : []);
    }
  }, [url]);

  function persist(list: Saved[]) {
    setSaved(list);
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  function add() {
    if (!spotifyEmbed(draftUrl)) return setErr("Paste a Spotify playlist, album or song link.");
    const item = { name: draftName.trim() || `Playlist ${saved.length + 1}`, url: draftUrl.trim() };
    persist([item, ...saved.filter((p) => p.url !== item.url)]);
    onSave(item.url);
    setDraftName("");
    setDraftUrl("");
    setAdding(false);
    setErr("");
  }

  function remove(p: Saved) {
    const list = saved.filter((x) => x.url !== p.url);
    persist(list);
    if (p.url === url) onSave(list[0]?.url || null);
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-[45]" onClick={onClose} />}
      <div className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300"
        style={{ transform: open ? "translateY(0)" : "translateY(110%)" }}>
        <div className="max-w-md mx-auto p-5 pb-8 max-h-[90vh] overflow-y-auto" style={{ background: t.card, borderTopLeftRadius: t.radius, borderTopRightRadius: t.radius }}>
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${t.accent}22`, color: t.accent }}>
                <Music size={18} />
              </span>
              <p className="text-xl">Workout <span style={{ color: t.accent }}>music</span></p>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", borderRadius: t.pill }} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {saved.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {saved.map((p) => {
                const active = p.url === url;
                return (
                  <div key={p.url} className="flex items-center shrink-0" style={{ background: active ? t.accent : "rgba(255,255,255,0.08)", color: active ? t.onAccent : "#fff", borderRadius: t.pill }}>
                    <button onClick={() => onSave(p.url)} className="pl-4 pr-2 py-2 text-sm">{p.name}</button>
                    <button onClick={() => remove(p)} className="pr-3 pl-1 py-2 opacity-60" aria-label={`Remove ${p.name}`}><Trash2 size={13} /></button>
                  </div>
                );
              })}
              <button onClick={() => setAdding(true)} className="px-3 py-2 text-sm shrink-0 flex items-center gap-1" style={{ border: `1px dashed ${t.accent}`, color: t.accent, borderRadius: t.pill }}>
                <Plus size={14} /> Add
              </button>
            </div>
          )}

          {embed && !adding ? (
            <>
              <iframe key={embed} src={embed} className="w-full mt-3" height="352" style={{ borderRadius: 12, border: 0 }}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Spotify player" />
              <button onClick={onClose} className="mt-3 w-full py-3 text-sm" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
                Keep playing
              </button>
              <p className="mt-3 text-[11px] text-gray-500 text-center">
                Tap any song in the list to play it. Log in to Spotify in this browser for full songs.
              </p>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-gray-400">Open Spotify, go to any playlist, tap Share, then Copy link, and paste it here.</p>
              <input placeholder="Name it, like Leg day 🔥" value={draftName} onChange={(e) => setDraftName(e.target.value)}
                className="mt-4 w-full px-4 py-3 outline-none bg-black/30" style={{ borderRadius: t.small }} />
              <input placeholder="https://open.spotify.com/playlist/..." value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)}
                className="mt-2 w-full px-4 py-3 outline-none bg-black/30" style={{ borderRadius: t.small }} />
              {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
              <button onClick={add} className="mt-3 w-full py-3" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>Save playlist</button>
              <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1 text-xs" style={{ color: t.accent }}>
                Open Spotify to find a playlist <ExternalLink size={12} />
              </a>
              {adding && <button onClick={() => setAdding(false)} className="mt-3 w-full text-xs text-gray-500">Cancel</button>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}