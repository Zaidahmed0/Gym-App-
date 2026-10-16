"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  fallback?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

const STOCK: Record<string, number[]> = {
  hero: [9152548],
  legs: [5327530],
  chest: [11433060, 3837743, 15917308, 3837757],
  back: [20873830, 4162475, 4162488, 19549140],
  shoulders: [4164759, 7289367],
  arms: [17210042, 3763115, 16576530, 15216128],
  core: [2294363],
  cardio: [13896072, 11175793, 6455851, 1954524],
  fullbody: [3837439, 3888342],
  rest: [4164755, 4804312, 4720288],
};

function pexels(id: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
}

function pick(name: string, seed: string) {
  const ids = STOCK[name];
  if (!ids?.length) return null;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ids[h % ids.length];
}

function candidates(src: string | null, fallback?: string) {
  const list: string[] = [];
  const add = (s?: string | null) => {
    if (!s) return;
    list.push(s);
    const match = s.match(/^\/images\/([a-z]+)\.jpg(?:\?v=(.*))?$/);
    if (match) {
      const id = pick(match[1], decodeURIComponent(match[2] || ""));
      if (id) list.push(pexels(id));
      list.push(`/images/${match[1]}.svg`);
    }
  };
  add(src);
  add(fallback);
  return [...new Set(list)];
}

export default function Photo({ src, fallback, alt = "", className = "", style }: Props) {
  const list = candidates(src, fallback);
  const key = list.join("|");
  const [state, setState] = useState({ key, i: 0 });
  const i = state.key === key ? state.i : 0;

  if (i >= list.length) {
    return (
      <div className={className}
        style={{ ...style, background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))" }} />
    );
  }

  return (
    <img src={list[i]} alt={alt} className={className} style={style} loading="lazy"
      onError={() => setState({ key, i: i + 1 })} />
  );
}