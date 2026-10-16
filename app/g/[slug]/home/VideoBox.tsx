"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Photo from "./Photo";
import { youtubeId, type Theme } from "./types";

type Props = {
  theme: Theme;
  url: string | null;
  image: string;
  name?: string;
  className?: string;
  label?: string;
};

export default function VideoBox({ theme: t, url, image, name, className = "", label = "Tap to watch form" }: Props) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);
  const searchUrl = name
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " proper form")}`
    : null;

  if (playing && id) {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`} style={{ borderRadius: t.radius }}>
        <iframe className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title="Exercise video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    );
  }

  const inner = (
    <>
      <Photo src={image} fallback="/images/fullbody.jpg" className="absolute inset-0 w-full h-full object-cover grayscale" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.7), transparent 55%)" }} />
      {(id || searchUrl) && (
        <>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: t.accent, color: t.onAccent, boxShadow: `0 0 0 10px ${t.accent}33` }}>
              <Play size={26} fill={t.onAccent} />
            </span>
          </span>
          <span className="absolute bottom-3 left-3 text-xs px-3 py-1 bg-black/70 text-white" style={{ borderRadius: t.pill }}>
            {id ? label : "Watch on YouTube ↗"}
          </span>
        </>
      )}
    </>
  );

  if (!id && searchUrl) {
    return (
      <a href={searchUrl} target="_blank" rel="noreferrer"
        className={`relative overflow-hidden block w-full ${className}`} style={{ background: t.card, borderRadius: t.radius }}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={() => id && setPlaying(true)} disabled={!id}
      className={`relative overflow-hidden block w-full ${className}`} style={{ background: t.card, borderRadius: t.radius }}>
      {inner}
    </button>
  );
}