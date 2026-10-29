import { useEffect, useRef, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

type Player = { destroy: () => void; playVideo: () => void };
type YoutubeApi = { Player: new (element: HTMLElement, options: { videoId: string; host: string; playerVars: Record<string, string | number>; events: { onStateChange: (event: { data: number }) => void; onError: (event: { data: number }) => void } }) => Player };
declare global { interface Window { YT?: YoutubeApi; onYouTubeIframeAPIReady?: () => void } }
let apiPromise: Promise<YoutubeApi> | undefined;
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) apiPromise = new Promise(resolve => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); if (window.YT) resolve(window.YT); };
    const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(script);
  });
  return apiPromise;
}
export function LecturePlayer({ id }: { id: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ended, setEnded] = useState(false); const [error, setError] = useState(""); const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true; let player: Player | undefined;
    setEnded(false); setError("");
    loadApi().then(api => {
      if (!active || !container.current) return;
      const element = document.createElement("div"); container.current.replaceChildren(element);
      player = new api.Player(element, { videoId: id, host: "https://www.youtube-nocookie.com", playerVars: { origin: window.location.origin, rel: 0, playsinline: 1 }, events: {
        onStateChange: e => { if (active && e.data === 0) setEnded(true); },
        onError: () => { if (active) setError("This video is unavailable or its creator does not allow in-app playback."); },
      } });
    });
    return () => { active = false; player?.destroy(); };
  }, [id, retry]);
  return <>
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-background">
      <div ref={container} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
      {(ended || error) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background p-4 text-center">
        <CheckCircle2 className="text-primary" size={40} />
        <h3 className="text-xl font-semibold">{error ? "Video unavailable" : "Lesson Complete"}</h3>
        {error && <p className="text-sm text-muted-foreground">{error}</p>}
        <Button variant="outline" onClick={() => setRetry(r => r + 1)}><RotateCcw />{error ? "Try again" : "Replay lecture"}</Button>
      </div>}
    </div>
    {!ended && !error && <Button variant="link" size="sm" onClick={() => setEnded(true)}>Mark lesson as finished</Button>}
  </>;
}