"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Lock, X, Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { FONTS, BACKGROUNDS, textOn, formatDate, type Branding } from "@/utils/theme";
import {
  parse, shift, diffDays, youtubeId,
  type Item, type Exercise, type Membership, type Progress, type Me, type Log, type Settings, type Theme, type FeedItem,
} from "./types";
import HomeTab from "./HomeTab";
import WorkoutsTab from "./WorkoutsTab";
import ProgressTab from "./ProgressTab";
import ProfileTab from "./ProfileTab";
import WorkoutMode from "./WorkoutMode";
import MusicSheet from "./MusicSheet";
import NotificationsSheet, { AnnouncementPopup } from "./NotificationsSheet";
import FitIcon, { FIT } from "./FitIcon";

type Tab = "home" | "workouts" | "progress" | "profile";
type Announcement = { id: string; title: string; body: string | null; image_url: string | null; audience: string; pinned: boolean; popup: boolean; created_at: string };
type Notif = { id: string; kind: string; title: string; body: string | null; image_url: string | null; read_at: string | null; created_at: string };

const DEFAULT_SETTINGS: Settings = {
  goal: null, target_weight: null, height_cm: null, spotify_url: null, water_goal: 8, announcements_seen_at: null,
};

const NAV = [
  { key: "home", label: "Home", icon: FIT.home },
  { key: "workouts", label: "Workouts", icon: FIT.workouts },
  { key: "progress", label: "Progress", icon: FIT.progress },
  { key: "profile", label: "Profile", icon: FIT.profile },
] as const;

function audienceOk(audience: string, left: number) {
  if (audience === "active") return left >= 0;
  if (audience === "expiring") return left >= 0 && left <= 7;
  return true;
}

function isNewer(a: string, b: string | null) {
  return !b || new Date(a).getTime() > new Date(b).getTime();
}

function annToFeed(a: Announcement, seen: string | null): FeedItem {
  return { id: "a-" + a.id, kind: "announcement", title: a.title, body: a.body, image_url: a.image_url, created_at: a.created_at, pinned: a.pinned, unread: isNewer(a.created_at, seen) };
}

function notifToFeed(n: Notif): FeedItem {
  return { id: "n-" + n.id, kind: n.kind, title: n.title, body: n.body, image_url: n.image_url, created_at: n.created_at, unread: !n.read_at };
}

export default function MemberHome() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [gym, setGym] = useState<Branding | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [planTitle, setPlanTitle] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [water, setWater] = useState(0);
  const [todayStr, setTodayStr] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [video, setVideo] = useState<string | null>(null);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedSnapshot, setFeedSnapshot] = useState<FeedItem[]>([]);
  const [popup, setPopup] = useState<FeedItem | null>(null);

  useEffect(() => {
    async function init() {
      const t = formatDate(new Date());
      setTodayStr(t);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace(`/g/${slug}`);

      const { data: b } = await supabase.rpc("get_gym_branding", { p_slug: slug });
      const g = (b as Branding[] | null)?.[0];
      const { data: p } = await supabase.from("profiles").select("id, full_name, email, role, gym_id, is_active").eq("id", user.id).single();

      if (!g || !p || p.role !== "member" || p.gym_id !== g.id) {
        await supabase.auth.signOut();
        return router.replace(`/g/${slug}`);
      }
      setGym(g);
      setMe(p);

      const [ms, mp, lg, pr, lib, st, wt, an, nf] = await Promise.all([
        supabase.from("memberships").select("plan_name, start_date, end_date").eq("member_id", user.id).order("end_date", { ascending: false }).limit(1),
        supabase.from("member_plans").select("plan_id, workout_plans(title)").eq("member_id", user.id).limit(1),
        supabase.from("workout_logs").select("exercise_id, log_date").eq("member_id", user.id).gte("log_date", shift(t, -90)),
        supabase.from("body_progress").select("id, log_date, weight_kg").eq("member_id", user.id).order("log_date", { ascending: false }).limit(60),
        supabase.from("exercises").select("id, name, category, youtube_url, instructions, image_url").order("name"),
        supabase.from("member_settings").select("goal, target_weight, height_cm, spotify_url, water_goal, announcements_seen_at").eq("member_id", user.id).maybeSingle(),
        supabase.from("water_logs").select("glasses").eq("member_id", user.id).eq("log_date", t).maybeSingle(),
        supabase.from("announcements").select("id, title, body, image_url, audience, pinned, popup, created_at").eq("gym_id", g.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("notifications").select("id, kind, title, body, image_url, read_at, created_at").eq("member_id", user.id).order("created_at", { ascending: false }).limit(30),
      ]);

      const msRow = ms.data?.[0] || null;
      setMembership(msRow);

      const assigned = mp.data?.[0] as unknown as { plan_id: string; workout_plans: { title: string } | null } | undefined;
      if (assigned) {
        setPlanTitle(assigned.workout_plans?.title || "My plan");
        const { data: pe } = await supabase
          .from("plan_exercises")
          .select("id, exercise_id, day_of_week, sets, reps, rest_seconds, sort_order, exercises(name, category, youtube_url, instructions, image_url)")
          .eq("plan_id", assigned.plan_id)
          .order("sort_order");
        setItems((pe as unknown as Item[]) || []);
      }

      const settingsRow: Settings = { ...DEFAULT_SETTINGS, ...((st.data as Partial<Settings>) || {}) };
      const anns = (an.data as Announcement[]) || [];
      const nts = (nf.data as Notif[]) || [];
      const leftNow = msRow ? diffDays(t, msRow.end_date) : -1;

      setLogs((lg.data as Log[]) || []);
      setProgress((pr.data as Progress[]) || []);
      setLibrary((lib.data as Exercise[]) || []);
      setSettings(settingsRow);
      setWater(wt.data?.glasses || 0);
      setAnnouncements(anns);
      setNotifs(nts);

      const welcome = nts.find((n) => !n.read_at && n.kind === "welcome");
      const freshAnn = anns.find((a) => a.popup && audienceOk(a.audience, leftNow) && isNewer(a.created_at, settingsRow.announcements_seen_at));
      const otherUnread = nts.find((n) => !n.read_at && n.kind !== "welcome");
      if (welcome) setPopup(notifToFeed(welcome));
      else if (freshAnn) setPopup(annToFeed(freshAnn, settingsRow.announcements_seen_at));
      else if (otherUnread) setPopup(notifToFeed(otherUnread));

      setLoading(false);
    }
    init();
  }, [slug]);

  async function markDone(exerciseId: string) {
    if (!me || !gym) return;
    if (logs.some((l) => l.exercise_id === exerciseId && l.log_date === todayStr)) return;
    setLogs((l) => [...l, { exercise_id: exerciseId, log_date: todayStr }]);
    await supabase
      .from("workout_logs")
      .upsert(
        { member_id: me.id, gym_id: gym.id, exercise_id: exerciseId, log_date: todayStr },
        { onConflict: "member_id,exercise_id,log_date", ignoreDuplicates: true }
      );
  }

  async function toggle(exerciseId: string) {
    if (!me) return;
    const done = logs.some((l) => l.exercise_id === exerciseId && l.log_date === todayStr);
    if (done) {
      setLogs((l) => l.filter((x) => !(x.exercise_id === exerciseId && x.log_date === todayStr)));
      await supabase.from("workout_logs").delete().eq("member_id", me.id).eq("exercise_id", exerciseId).eq("log_date", todayStr);
    } else {
      if (navigator.vibrate) navigator.vibrate(30);
      await markDone(exerciseId);
    }
  }

  async function saveWeight(kg: number) {
    if (!me) return "Not logged in";
    const { data, error } = await supabase
      .from("body_progress")
      .insert({ member_id: me.id, log_date: todayStr, weight_kg: kg })
      .select("id, log_date, weight_kg")
      .single();
    if (error) return error.message;
    setProgress((p) => [data as Progress, ...p]);
    return null;
  }

  async function saveSettings(partial: Partial<Settings>) {
    if (!me) return;
    const next = { ...settings, ...partial };
    setSettings(next);
    await supabase.from("member_settings").upsert({ member_id: me.id, ...next, updated_at: new Date().toISOString() });
  }

  async function changeWater(delta: number) {
    if (!me) return;
    const n = Math.max(0, water + delta);
    setWater(n);
    await supabase.from("water_logs").upsert({ member_id: me.id, log_date: todayStr, glasses: n }, { onConflict: "member_id,log_date" });
  }

  async function changePassword(pass: string) {
    if (pass.length < 8) return "Password must be at least 8 characters.";
    const { error } = await supabase.auth.updateUser({ password: pass });
    return error ? "Error: " + error.message : "Password changed";
  }

  async function markAllSeen() {
    if (!me) return;
    const now = new Date().toISOString();
    setNotifs((ns) => ns.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await Promise.all([
      saveSettings({ announcements_seen_at: now }),
      supabase.from("notifications").update({ read_at: now }).eq("member_id", me.id).is("read_at", null),
    ]);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace(`/g/${slug}`);
  }

  if (loading || !gym || !me) return <main className="min-h-screen bg-black" />;

  const bgTheme = BACKGROUNDS[gym.theme_bg || "midnight"];
  const font = FONTS[gym.font_style || "bold"];
  const sharp = gym.card_style === "sharp";
  const theme: Theme = {
    accent: gym.accent_color,
    onAccent: textOn(gym.accent_color),
    bg: bgTheme.bg,
    card: bgTheme.card,
    radius: sharp ? "8px" : "24px",
    pill: sharp ? "8px" : "999px",
    small: sharp ? "6px" : "14px",
  };

  const firstName = me.full_name.split(" ")[0];
  const left = membership ? diffDays(todayStr, membership.end_date) : -1;
  const doneToday = logs.filter((l) => l.log_date === todayStr).map((l) => l.exercise_id);
  const dateSet = new Set(logs.map((l) => l.log_date));
  let streak = 0;
  let cursor = dateSet.has(todayStr) ? todayStr : shift(todayStr, -1);
  while (dateSet.has(cursor)) {
    streak++;
    cursor = shift(cursor, -1);
  }
  const totalDays = dateSet.size;
  const level = Math.floor(totalDays / 5) + 1;
  const levelPct = (totalDays % 5) / 5;
  const dow = parse(todayStr).getDay();
  const todayItems = items.filter((i) => i.day_of_week === dow);

  const feed: FeedItem[] = [
    ...announcements.filter((a) => audienceOk(a.audience, left)).map((a) => annToFeed(a, settings.announcements_seen_at)),
    ...notifs.map(notifToFeed),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const unreadCount = feed.filter((f) => f.unread).length;
  const banner = feed.find((f) => f.pinned) || null;

  function openFeed() {
    setFeedSnapshot(feed);
    setFeedOpen(true);
    markAllSeen();
  }

  const logo = gym.logo_url ? (
    <img src={gym.logo_url} alt="" className="w-10 h-10 object-cover" style={{ borderRadius: theme.small }} />
  ) : (
    <div className="w-10 h-10 flex items-center justify-center text-sm" style={{ background: theme.accent, color: theme.onAccent, borderRadius: theme.small }}>
      {gym.name.slice(0, 2).toUpperCase()}
    </div>
  );

  if (!me.is_active || left < 0) {
    return (
      <main className={`min-h-screen text-white flex items-center justify-center p-6 ${font.className}`} style={{ background: theme.bg }}>
        <div className="max-w-sm text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${theme.accent}22`, color: theme.accent }}>
            <Lock size={28} />
          </div>
          <h1 className="mt-6 text-4xl leading-none">
            {!me.is_active ? "Access" : "Plan"}<br /><span style={{ color: theme.accent }}>{!me.is_active ? "paused" : "expired"}</span>
          </h1>
          <p className="mt-4 text-gray-400 text-sm">
            {!me.is_active
              ? `Your access to ${gym.name} is paused. Talk to the front desk to get back in.`
              : `Your ${membership?.plan_name || ""} plan ended on ${membership?.end_date}. Renew at ${gym.name} to keep your streak going.`}
          </p>
          <button onClick={logout} className="mt-8 px-6 py-3 text-sm border border-white/20" style={{ borderRadius: theme.pill }}>Log out</button>
        </div>
      </main>
    );
  }

  const openVideo = (url: string) => {
    const id = youtubeId(url);
    if (id) setVideo(id);
  };

  const iconBtn = { background: theme.card, borderRadius: theme.pill };

  return (
    <main className={`min-h-screen text-white ${font.className}`} style={{ background: theme.bg }}>
      <div className="max-w-md mx-auto px-5 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo}
            <span className="text-sm">{gym.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {left <= 7 && (
              <span className="text-xs px-3 py-1 bg-orange-500/20 text-orange-300" style={{ borderRadius: theme.pill }}>
                {left === 0 ? "Ends today" : `${left}d left`}
              </span>
            )}
            <button onClick={() => setMusicOpen(true)} className="w-10 h-10 flex items-center justify-center relative" style={iconBtn} aria-label="Music">
              <Music size={18} />
              {settings.spotify_url && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: theme.accent }} />}
            </button>
            <button onClick={openFeed} className="w-10 h-10 flex items-center justify-center relative" style={iconBtn} aria-label="Notifications">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] flex items-center justify-center"
                  style={{ background: theme.accent, color: theme.onAccent }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === "home" && (
              <HomeTab
                theme={theme}
                firstName={firstName}
                welcome={gym.welcome_text}
                todayStr={todayStr}
                items={items}
                logs={logs}
                doneToday={doneToday}
                planTitle={planTitle}
                streak={streak}
                level={level}
                levelPct={levelPct}
                water={water}
                waterGoal={settings.water_goal || 8}
                banner={banner}
                onBanner={openFeed}
                onStart={() => setWorkoutOpen(true)}
                onToggle={toggle}
                onWater={changeWater}
                onVideo={openVideo}
                onGo={(t) => setTab(t)}
                onMusic={() => setMusicOpen(true)}
              />
            )}
            {tab === "workouts" && (
              <WorkoutsTab theme={theme} items={items} library={library} todayStr={todayStr} doneToday={doneToday} planTitle={planTitle} />
            )}
            {tab === "progress" && (
              <ProgressTab
                theme={theme}
                todayStr={todayStr}
                logs={logs}
                progress={progress}
                settings={settings}
                streak={streak}
                totalDays={totalDays}
                onSaveWeight={saveWeight}
                onSaveSettings={saveSettings}
              />
            )}
            {tab === "profile" && (
              <ProfileTab
                theme={theme}
                me={me}
                membership={membership}
                daysLeft={left}
                streak={streak}
                level={level}
                levelPct={levelPct}
                totalDays={totalDays}
                settings={settings}
                onSaveSettings={saveSettings}
                onPassword={changePassword}
                onLogout={logout}
                onMusic={() => setMusicOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30" style={{ background: theme.bg, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-md mx-auto flex justify-around py-3 text-[11px]">
          {NAV.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)} className="flex flex-col items-center gap-1 relative w-16"
              style={{ color: tab === key ? theme.accent : "#777" }}>
              {tab === key && <motion.span layoutId="navdot" className="absolute -top-3 w-8 h-1 rounded-full" style={{ background: theme.accent }} />}
              <FitIcon icon={icon} size={24} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {workoutOpen && (
          <WorkoutMode
            theme={theme}
            items={todayItems}
            doneToday={doneToday}
            streak={streak}
            onComplete={markDone}
            onClose={() => setWorkoutOpen(false)}
            onMusic={() => setMusicOpen(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {video && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]" onClick={() => setVideo(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-video overflow-hidden" style={{ borderRadius: theme.radius }}>
                <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0&playsinline=1`}
                  title="Exercise video" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
              <button onClick={() => setVideo(null)} className="mt-4 w-full py-3 flex items-center justify-center gap-2"
                style={{ background: theme.accent, color: theme.onAccent, borderRadius: theme.pill }}>
                <X size={18} /> Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MusicSheet theme={theme} url={settings.spotify_url} open={musicOpen} onClose={() => setMusicOpen(false)}
        onSave={(url) => saveSettings({ spotify_url: url })} />

      <NotificationsSheet theme={theme} open={feedOpen} items={feedSnapshot} onClose={() => setFeedOpen(false)} />

      <AnnouncementPopup theme={theme} item={popup} onClose={() => { setPopup(null); markAllSeen(); }} />
    </main>
  );
}