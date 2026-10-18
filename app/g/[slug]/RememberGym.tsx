"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function RememberGym() {
  const { slug } = useParams<{ slug: string }>();
  useEffect(() => {
    if (slug) localStorage.setItem("last-gym", slug);
  }, [slug]);
  return null;
}   