"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/utils";
import type { ExperienceRecord } from "@/types/nfc";

type ExperiencePlayerProps = {
  experience: ExperienceRecord;
};

export function ExperiencePlayer({ experience }: ExperiencePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoplayPendingRef = useRef(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(experience.durationSeconds);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const activeAudio = audio;

    async function attemptAutoplay(allowMutedFallback = true) {
      if (!activeAudio.paused) {
        setAutoplayBlocked(false);
        return true;
      }

      if (autoplayPendingRef.current) {
        return false;
      }

      autoplayPendingRef.current = true;

      try {
        await activeAudio.play();
        setAutoplayBlocked(false);
        return true;
      } catch {
        if (!allowMutedFallback) {
          setAutoplayBlocked(true);
          return false;
        }

        const previousMuted = activeAudio.muted;

        try {
          // Some mobile browsers permit autoplay only after a muted warm start.
          activeAudio.muted = true;
          await activeAudio.play();
          activeAudio.muted = previousMuted;
          setAutoplayBlocked(false);
          return true;
        } catch {
          activeAudio.muted = previousMuted;
          setAutoplayBlocked(true);
          return false;
        }
      } finally {
        autoplayPendingRef.current = false;
      }
    }

    function attemptAutoplayFromGesture() {
      void attemptAutoplay(false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void attemptAutoplay();
      }
    }

    function handlePageShow() {
      void attemptAutoplay();
    }

    function handleBridgeReady() {
      void attemptAutoplay();
    }

    function attachGestureRetry() {
      window.addEventListener("pointerdown", attemptAutoplayFromGesture, {
        passive: true,
      });
      window.addEventListener("touchstart", attemptAutoplayFromGesture, {
        passive: true,
      });
      window.addEventListener("keydown", attemptAutoplayFromGesture);
    }

    function detachGestureRetry() {
      window.removeEventListener("pointerdown", attemptAutoplayFromGesture);
      window.removeEventListener("touchstart", attemptAutoplayFromGesture);
      window.removeEventListener("keydown", attemptAutoplayFromGesture);
    }

    function refreshGestureRetry() {
      if (activeAudio.paused) {
        attachGestureRetry();
      } else {
        detachGestureRetry();
      }
    }

    function syncState() {
      setCurrentTime(activeAudio.currentTime || 0);
      setDuration(activeAudio.duration || experience.durationSeconds);
      setIsPlaying(!activeAudio.paused);
      refreshGestureRetry();
    }

    const handleLoaded = () => {
      syncState();
      void attemptAutoplay();
    };

    const handleCanPlay = () => {
      void attemptAutoplay();
    };

    activeAudio.addEventListener("loadedmetadata", handleLoaded);
    activeAudio.addEventListener("canplay", handleCanPlay);
    activeAudio.addEventListener("timeupdate", syncState);
    activeAudio.addEventListener("play", syncState);
    activeAudio.addEventListener("pause", syncState);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("WeixinJSBridgeReady", handleBridgeReady);
    document.addEventListener("YixinJSBridgeReady", handleBridgeReady);
    attachGestureRetry();

    if (activeAudio.readyState >= 1) {
      handleLoaded();
    } else {
      void attemptAutoplay();
    }

    return () => {
      detachGestureRetry();
      activeAudio.removeEventListener("loadedmetadata", handleLoaded);
      activeAudio.removeEventListener("canplay", handleCanPlay);
      activeAudio.removeEventListener("timeupdate", syncState);
      activeAudio.removeEventListener("play", syncState);
      activeAudio.removeEventListener("pause", syncState);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("WeixinJSBridgeReady", handleBridgeReady);
      document.removeEventListener("YixinJSBridgeReady", handleBridgeReady);
    };
  }, [experience.durationSeconds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    audio.load();
    setCurrentTime(0);
    setDuration(experience.durationSeconds);
    setIsPlaying(false);
    setAutoplayBlocked(false);
  }, [experience.processedAudioPath, experience.durationSeconds]);

  useEffect(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug: experience.slug }),
    });
  }, [experience.slug]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const activeCanvas = canvas;
    const activeContext = context;
    const { amplitudeFrames, spectrumFrames } = experience.analysis;
    const config = experience.visualConfig;
    let frameHandle = 0;

    function resizeCanvas() {
      const ratio = window.devicePixelRatio || 1;
      const width = activeCanvas.clientWidth;
      const height = activeCanvas.clientHeight;

      activeCanvas.width = Math.floor(width * ratio);
      activeCanvas.height = Math.floor(height * ratio);
      activeContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw(time: number) {
      const width = activeCanvas.clientWidth;
      const height = activeCanvas.clientHeight;
      activeContext.clearRect(0, 0, width, height);

      const audioDuration = audio?.duration || experience.durationSeconds || 1;
      const audioProgress =
        audio && audioDuration > 0
          ? (audio.currentTime % audioDuration) / audioDuration
          : ((time / 1000) % audioDuration) / audioDuration;

      const frameIndex = Math.min(
        amplitudeFrames.length - 1,
        Math.max(0, Math.floor(audioProgress * (amplitudeFrames.length - 1))),
      );
      const amplitude = amplitudeFrames[frameIndex] ?? 0;
      const spectrum = spectrumFrames[frameIndex] ?? [];
      const breath =
        (Math.sin((time / 1000) * ((2 * Math.PI) / config.breathCycle)) + 1) / 2;

      const glow = activeContext.createRadialGradient(
        width / 2,
        height * 0.44,
        16,
        width / 2,
        height * 0.44,
        width * 0.4,
      );
      glow.addColorStop(0, `rgba(216, 185, 141, ${0.12 + amplitude * 0.3})`);
      glow.addColorStop(0.55, `rgba(143, 185, 210, ${0.08 + breath * 0.14})`);
      glow.addColorStop(1, "rgba(4, 6, 10, 0)");

      activeContext.fillStyle = glow;
      activeContext.beginPath();
      activeContext.arc(width / 2, height * 0.44, width * 0.36, 0, Math.PI * 2);
      activeContext.fill();

      const lineCount = Math.max(10, Math.round(config.lineDensity));
      activeContext.save();
      activeContext.translate(width / 2, height * 0.58);

      for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
        const lineProgress = lineIndex / Math.max(lineCount - 1, 1);
        const baseY = (lineProgress - 0.48) * height * 0.7;
        const head =
          Math.exp(-Math.pow((lineProgress - 0.18) / 0.09, 2)) * width * 0.12;
        const shoulders =
          Math.exp(-Math.pow((lineProgress - 0.36) / 0.14, 2)) * width * 0.22;
        const robe =
          Math.exp(-Math.pow((lineProgress - 0.74) / 0.23, 2)) * width * 0.3;
        const waist =
          Math.exp(-Math.pow((lineProgress - 0.57) / 0.11, 2)) * width * 0.1;
        const halfWidth = 14 + head + shoulders + robe - waist;
        const energy = spectrum[lineIndex % Math.max(spectrum.length, 1)] ?? amplitude;
        const opacity =
          config.brightnessMin +
          breath * (config.brightnessMax - config.brightnessMin) +
          amplitude * 0.24;

        activeContext.strokeStyle = `rgba(246, 242, 234, ${Math.min(opacity, 0.88).toFixed(
          3,
        )})`;
        activeContext.lineWidth = 1 + energy * 1.6;
        activeContext.beginPath();

        for (let x = -halfWidth; x <= halfWidth; x += 6) {
          const xProgress = x / Math.max(halfWidth, 1);
          const envelope = Math.pow(1 - Math.abs(xProgress), 0.38);
          const wave =
            Math.sin(
              xProgress * Math.PI * (2 + config.revealFrequency * 8) +
                time * 0.0014 * (1 + config.dynamicIntensity) +
                lineProgress * 9,
            ) *
              amplitude *
              16 *
              config.dynamicIntensity *
              envelope +
            Math.cos(
              xProgress * Math.PI * 2.4 -
                time * 0.0008 * (0.6 + energy) +
                lineProgress * 14,
            ) *
              breath *
              8 *
              config.revealFrequency *
              envelope;
          const drift = Math.sin(time * 0.00035 + lineProgress * 10) * 18;
          const pointY = baseY + wave + drift * config.dynamicIntensity;

          if (x === -halfWidth) {
            activeContext.moveTo(x, pointY);
          } else {
            activeContext.lineTo(x, pointY);
          }
        }

        activeContext.stroke();
      }

      activeContext.restore();
      frameHandle = window.requestAnimationFrame(draw);
    }

    resizeCanvas();
    frameHandle = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(frameHandle);
    };
  }, [experience]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
      return;
    }

    audio.pause();
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 opacity-22"
        style={
          experience.coverPath
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(3, 5, 9, 0.72), rgba(3, 5, 9, 0.92)), url(/media/${experience.coverPath})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="eyebrow text-[11px] uppercase tracking-[0.24em]">
            NFC Nature Memory
          </div>
          <div className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/48">
            {experience.slug}
          </div>
        </div>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-0">
          <section className="relative flex min-h-[56vh] items-center justify-center">
            <div className="absolute inset-0 -z-10 rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,12,20,0.42),rgba(4,6,10,0.08))]" />
            <canvas ref={canvasRef} className="h-[56vh] w-full max-w-4xl" />

            {autoplayBlocked ? (
              <button
                type="button"
                onClick={togglePlayback}
                className="metal-button absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 text-sm tracking-[0.18em] uppercase"
              >
                轻触开启声音
              </button>
            ) : null}
          </section>

          <aside className="glass-panel noise-overlay rounded-[32px] p-6 sm:p-8">
            <div className="eyebrow w-fit text-[11px] uppercase tracking-[0.24em]">
              Bound Memory
            </div>
            <h1 className="display-font mt-6 text-4xl leading-tight text-white">
              {experience.name}
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62">
              {experience.quote || "一段自然之声，被封存在这个物件的内部。"}
            </p>

            <div className="mt-8 rounded-[28px] border border-white/8 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-white/42">播放控制</p>
              <div className="mt-5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="metal-button flex h-14 w-14 items-center justify-center"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm text-white/56">
                    <span className="inline-flex items-center gap-2">
                      <Volume2 size={16} />
                      {isPlaying ? "播放中" : "静候开启"}
                    </span>
                    <span>{`${formatDuration(currentTime)} / ${formatDuration(duration)}`}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#d8b98d,#f6f2ea)]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, (currentTime / Math.max(duration, 1)) * 100),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 text-xs text-white/48 sm:grid-cols-2">
              <div className="rounded-full border border-white/8 px-4 py-3">
                动画模板：
                {
                  {
                    static: "静态型",
                    breathing: "呼吸型",
                    floating: "漂浮型",
                    flicker: "明灭型",
                  }[experience.visualPreset]
                }
              </div>
              <div className="rounded-full border border-white/8 px-4 py-3">
                音频时长：{formatDuration(experience.durationSeconds)}
              </div>
              <div className="rounded-full border border-white/8 px-4 py-3">
                亮度范围：{experience.visualConfig.brightnessMin.toFixed(2)} -{" "}
                {experience.visualConfig.brightnessMax.toFixed(2)}
              </div>
              <div className="rounded-full border border-white/8 px-4 py-3">
                呼吸周期：{experience.visualConfig.breathCycle.toFixed(1)}s
              </div>
            </div>
          </aside>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={`/media/${experience.processedAudioPath}`}
        autoPlay
        loop
        playsInline
        preload="auto"
      />
    </main>
  );
}
