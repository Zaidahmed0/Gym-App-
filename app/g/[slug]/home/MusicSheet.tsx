"use client";

import { useState } from "react";
import { Music, X, ExternalLink } from "lucide-react";
import { spotifyEmbed, type Theme } from "./types";

type Props = {
  theme: Theme;
  url: string | null;
  open: boolean;
  onClose: () => void;
  onSave: (url: string | null) => void;
};

export default function MusicSheet({ theme: t, url, open, onClose, onSave }: Props) {
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState("");
  const embed = spotifyEmbed(url);

  function save() {
    if (!spotifyEmbed(draft)) return setErr("Paste a Spotify playlist, album or song link.");
    onSave(draft.trim());
    setDraft("");
    setEditing(false);
    setErr("");
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-[45]" onClick={onClose} />}
      <div className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300"
        style={{ transform: open ? "translateY(0)" : "translateY(110%)" }}>
        <div className="max-w-md mx-auto p-5 pb-8" style={{ background: t.card, borderTopLeftRadius: t.radius, borderTopRightRadius: t.radius }}>
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

          {embed && !editing ? (
            <>
              <iframe src={embed} className="w-full" height="352" style={{ borderRadius: 12, border: 0 }}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title="Spotify player" />
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing(true)} className="flex-1 py-3 text-sm" style={{ background: "rgba(255,255,255,0.08)", borderRadius: t.pill }}>
                  Change playlist
                </button>
                <button onClick={onClose} className="flex-1 py-3 text-sm" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>
                  Keep playing
                </button>
              </div>
              <p className="mt-3 text-[11px] text-gray-500 text-center">
                Music keeps playing while you use the app. Log in to Spotify in this browser for full songs.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400">Open Spotify, go to any playlist, tap Share, then Copy link, and paste it here.</p>
              <input placeholder="https://open.spotify.com/playlist/..." value={draft} onChange={(e) => setDraft(e.target.value)}
                className="mt-4 w-full px-4 py-3 outline-none bg-black/30" style={{ borderRadius: t.small }} />
              {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
              <button onClick={save} className="mt-3 w-full py-3" style={{ background: t.accent, color: t.onAccent, borderRadius: t.pill }}>Save playlist</button>
              <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1 text-xs" style={{ color: t.accent }}>
                Open Spotify to find a playlist <ExternalLink size={12} />
              </a>
              {editing && <button onClick={() => setEditing(false)} className="mt-3 w-full text-xs text-gray-500">Cancel</button>}
            </>
          )}
        </div>
      </div>
    </>
  );
}