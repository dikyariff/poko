"use client";

import * as React from "react";

import {
  DEFAULT_BLOBATAR_FRAME,
  DEFAULT_BLOBATAR_MOOD,
  DEFAULT_BLOBATAR_SEED,
  generateBlobatarSpec,
  type BlobatarAccessoryType,
  type BlobatarFrame,
  type BlobatarMood,
} from "@/lib/blobatar";
import { cn } from "@/lib/utils";

export type BlobatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BlobatarAvatarProps {
  /** Seed deterministik dari identitas profil Clerk user. */
  seed?: string;
  frame?: BlobatarFrame;
  /** Ekspresi dinamis Blobatar (dipakai antara lain oleh Insight Poko AI). */
  mood?: BlobatarMood;
  size?: BlobatarSize;
  showFrame?: boolean;
  trackCursor?: boolean;
  animateIdle?: boolean;
  interactive?: boolean;
  ariaLabel?: string;
  className?: string;
  svgClassName?: string;
}

const PUPIL_CLAMP_BOUNDS = { maxX: 2.3, maxY: 2.1 } as const;

const SIZE_CLASSES: Record<
  BlobatarSize,
  { container: string; svg: string; border: string; roundedRadius: string }
> = {
  xs: {
    container: "size-9 p-0.5",
    svg: "size-7",
    border: "border-2 shadow-none",
    roundedRadius: "rounded-[9px]",
  },
  sm: {
    container: "size-11 p-1",
    svg: "size-9",
    border: "border-2 shadow-brutal-sm",
    roundedRadius: "rounded-[11px]",
  },
  md: {
    container: "size-16 p-1.5",
    svg: "size-13",
    border: "border-[2.5px] shadow-brutal-sm",
    roundedRadius: "rounded-[13px]",
  },
  lg: {
    container: "size-24 p-2",
    svg: "size-20",
    border: "border-[2.5px] shadow-brutal",
    roundedRadius: "rounded-[16px]",
  },
  xl: {
    container: "size-32 p-2.5",
    svg: "size-27",
    border: "border-[3px] shadow-brutal",
    roundedRadius: "rounded-[18px]",
  },
};

function getFrameRadiusClass(frame: BlobatarFrame, size: BlobatarSize): string {
  if (frame === "circle") {
    return "rounded-[50%]";
  }
  if (frame === "squircle") {
    return "rounded-[32%]";
  }
  return SIZE_CLASSES[size].roundedRadius;
}

interface TrackedPupilTarget {
  getSvg: () => SVGSVGElement | null;
  getPupils: () => SVGGElement | null;
}

const trackedTargets = new Set<TrackedPupilTarget>();
let pointerListenersAttached = false;
let pointerRafId: number | null = null;
let lastPointerX = 0;
let lastPointerY = 0;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return true;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resetAllPupils(): void {
  trackedTargets.forEach((target) => {
    const group = target.getPupils();
    if (!group) return;
    group.style.transform = "translate(0px, 0px)";
    group.dataset.pupilX = "0";
    group.dataset.pupilY = "0";
  });
}

function flushTrackedPupils(): void {
  pointerRafId = null;

  if (prefersReducedMotion()) {
    resetAllPupils();
    return;
  }

  trackedTargets.forEach((target) => {
    const svg = target.getSvg();
    const group = target.getPupils();
    if (!svg || !group) return;

    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    if (rect.bottom < -40 || rect.top > window.innerHeight + 40) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = lastPointerX - cx;
    const dy = lastPointerY - cy;
    const angle = Math.atan2(dy, dx);
    const distanceRatio = Math.min(1, Math.hypot(dx, dy) / 220);

    const tx = Math.cos(angle) * PUPIL_CLAMP_BOUNDS.maxX * distanceRatio;
    const ty = Math.sin(angle) * PUPIL_CLAMP_BOUNDS.maxY * distanceRatio;
    const formattedX = tx.toFixed(2);
    const formattedY = ty.toFixed(2);

    group.style.transform = `translate(${formattedX}px, ${formattedY}px)`;
    group.dataset.pupilX = formattedX;
    group.dataset.pupilY = formattedY;
  });
}

function handleGlobalPointerMove(event: PointerEvent): void {
  if (event.pointerType === "touch") {
    return;
  }

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  if (pointerRafId === null) {
    pointerRafId = window.requestAnimationFrame(flushTrackedPupils);
  }
}

function handleGlobalPointerLeave(): void {
  resetAllPupils();
}

function attachGlobalPointerListeners(): void {
  if (pointerListenersAttached || typeof window === "undefined") {
    return;
  }
  window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
  document.addEventListener("pointerleave", handleGlobalPointerLeave);
  pointerListenersAttached = true;
}

function detachGlobalPointerListenersIfIdle(): void {
  if (!pointerListenersAttached || trackedTargets.size > 0 || typeof window === "undefined") {
    return;
  }
  window.removeEventListener("pointermove", handleGlobalPointerMove);
  document.removeEventListener("pointerleave", handleGlobalPointerLeave);
  if (pointerRafId !== null) {
    window.cancelAnimationFrame(pointerRafId);
    pointerRafId = null;
  }
  pointerListenersAttached = false;
}

function BlobatarAccessory({
  accessoryType,
  bodyColor,
}: {
  accessoryType: BlobatarAccessoryType;
  bodyColor: string;
}) {
  if (accessoryType === 0) {
    return (
      <>
        <path
          d="M50 22 Q50 11 58 9 Q56 18 50 20"
          fill="#C8FF3D"
          stroke="#111111"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M50 22 Q48 12 40 12 Q43 19 50 20"
          fill="#7CFFB2"
          stroke="#111111"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </>
    );
  }

  if (accessoryType === 1) {
    return (
      <path
        d="M36 23 L40 11 L50 17 L60 11 L64 23 Z"
        fill="#FFE14D"
        stroke="#111111"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  }

  if (accessoryType === 2) {
    return (
      <path
        d="M68 20 L71 26 L78 27 L73 31 L74 38 L68 35 L62 38 L63 31 L58 27 L65 26 Z"
        fill="#FFE14D"
        stroke="#111111"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    );
  }

  if (accessoryType === 3) {
    return (
      <>
        <circle cx="28" cy="28" r="8" fill={bodyColor} stroke="#111111" strokeWidth="3.5" />
        <circle cx="72" cy="28" r="8" fill={bodyColor} stroke="#111111" strokeWidth="3.5" />
      </>
    );
  }

  return (
    <>
      <path
        d="M27 36 Q50 26 73 36"
        fill="none"
        stroke="#111111"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="30" r="4.5" fill="#FFE14D" stroke="#111111" strokeWidth="2.5" />
    </>
  );
}

/**
 * Generator SVG Blobatar deterministik tunggal per akun Clerk,
 * dilengkapi 3 bingkai Neo-Brutalist, cursor-tracking pupils (clamped di dalam sklera),
 * dan animasi idle breathe & blink yang menghormati `prefers-reduced-motion`.
 */
export function BlobatarAvatar({
  seed = DEFAULT_BLOBATAR_SEED,
  frame = DEFAULT_BLOBATAR_FRAME,
  mood = DEFAULT_BLOBATAR_MOOD,
  size = "md",
  showFrame = true,
  trackCursor = true,
  animateIdle = true,
  interactive = false,
  ariaLabel,
  className,
  svgClassName,
}: BlobatarAvatarProps) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const pupilsRef = React.useRef<SVGGElement | null>(null);

  const spec = React.useMemo(() => generateBlobatarSpec(seed), [seed]);

  React.useEffect(() => {
    const group = pupilsRef.current;
    if (!trackCursor) {
      if (group) {
        group.style.transform = "translate(0px, 0px)";
        group.dataset.pupilX = "0";
        group.dataset.pupilY = "0";
      }
      return;
    }

    const target: TrackedPupilTarget = {
      getSvg: () => svgRef.current,
      getPupils: () => pupilsRef.current,
    };

    trackedTargets.add(target);
    attachGlobalPointerListeners();

    return () => {
      trackedTargets.delete(target);
      detachGlobalPointerListenersIfIdle();
    };
  }, [trackCursor]);

  const sizePreset = SIZE_CLASSES[size];
  const frameRadius = getFrameRadiusClass(frame, size);
  const resolvedAriaLabel = ariaLabel ?? `Blobatar ${spec.normalizedSeed}`;
  const blinkStyle = animateIdle
    ? ({ animationDelay: `${spec.blinkDelaySeconds}s` } satisfies React.CSSProperties)
    : undefined;

  const svgNode = (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      role="img"
      aria-label={resolvedAriaLabel}
      data-slot="blobatar-svg"
      data-seed={spec.normalizedSeed}
      data-mood={mood}
      className={cn(
        "poko-blobatar-svg block shrink-0 overflow-visible select-none",
        showFrame ? sizePreset.svg : sizePreset.container,
        svgClassName
      )}
    >
      <g
        data-slot="blobatar-body"
        className={cn("poko-blobatar-body", animateIdle && "poko-blobatar-idle")}
        style={animateIdle ? { animationDelay: `${spec.breatheDelaySeconds}s` } : undefined}
      >
        {spec.accessoryType === 3 ? (
          <BlobatarAccessory accessoryType={spec.accessoryType} bodyColor={spec.palette.body} />
        ) : null}

        <path
          d={spec.blobPath}
          fill={spec.palette.body}
          stroke="#111111"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Specular highlight */}
        <ellipse
          cx="35"
          cy="34"
          rx="7"
          ry="4"
          transform="rotate(-24 35 34)"
          fill="#FFFFFF"
          opacity="0.58"
        />

        {spec.accessoryType !== 3 ? (
          <BlobatarAccessory accessoryType={spec.accessoryType} bodyColor={spec.palette.body} />
        ) : null}

        {/* Cheeks */}
        <circle cx="29" cy="59" r="5" fill={spec.palette.cheek} opacity="0.72" />
        <circle cx="71" cy="59" r="5" fill={spec.palette.cheek} opacity="0.72" />

        {/* Eyes & Mouth by Mood */}
        <g
          data-slot="blobatar-eyes"
          className={cn("poko-blobatar-eyes", animateIdle && "poko-blobatar-blink")}
          style={blinkStyle}
        >
          {mood === "happy" ? (
            <>
              <circle cx="38" cy="50" r="6.4" fill="#FFFFFF" stroke="#111111" strokeWidth="2.6" />
              <circle cx="62" cy="50" r="6.4" fill="#FFFFFF" stroke="#111111" strokeWidth="2.6" />
              <g
                ref={pupilsRef}
                data-slot="blobatar-pupils"
                data-pupil-x="0"
                data-pupil-y="0"
                className="poko-blobatar-pupils"
              >
                <circle cx="38" cy="50" r="3.4" fill="#111111" />
                <circle cx="36.8" cy="48.6" r="1.2" fill="#FFFFFF" />
                <circle cx="62" cy="50" r="3.4" fill="#111111" />
                <circle cx="60.8" cy="48.6" r="1.2" fill="#FFFFFF" />
              </g>
            </>
          ) : null}

          {mood === "chill" ? (
            <g
              ref={pupilsRef}
              data-slot="blobatar-pupils"
              data-pupil-x="0"
              data-pupil-y="0"
              className="poko-blobatar-pupils"
            >
              <path
                d="M33 50 Q38 45.5 43 50"
                fill="none"
                stroke="#111111"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <path
                d="M57 50 Q62 45.5 67 50"
                fill="none"
                stroke="#111111"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            </g>
          ) : null}

          {mood === "hyped" ? (
            <g
              ref={pupilsRef}
              data-slot="blobatar-pupils"
              data-pupil-x="0"
              data-pupil-y="0"
              className="poko-blobatar-pupils"
            >
              <path d="M38 44 L40 49 L45 50 L40 52 L38 56 L36 52 L31 50 L36 49 Z" fill="#111111" />
              <path d="M62 44 L64 49 L69 50 L64 52 L62 56 L60 52 L55 50 L60 49 Z" fill="#111111" />
            </g>
          ) : null}

          {mood === "thinking" ? (
            <>
              <circle cx="38" cy="50" r="6" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
              <circle cx="62" cy="48.5" r="6.4" fill="#FFFFFF" stroke="#111111" strokeWidth="2.5" />
              <g
                ref={pupilsRef}
                data-slot="blobatar-pupils"
                data-pupil-x="0"
                data-pupil-y="0"
                className="poko-blobatar-pupils"
              >
                <circle cx="38" cy="50" r="3.2" fill="#111111" />
                <circle cx="62" cy="48.5" r="3.6" fill="#111111" />
              </g>
              <path d="M55 40 L67 38" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : null}

          {mood === "love" ? (
            <g
              ref={pupilsRef}
              data-slot="blobatar-pupils"
              data-pupil-x="0"
              data-pupil-y="0"
              className="poko-blobatar-pupils"
            >
              <path
                d="M38 54.5 C38 54.5 31 49.5 32 45.5 C33 42.5 37 43.5 38 46.5 C39 43.5 43 42.5 44 45.5 C45 49.5 38 54.5 38 54.5 Z"
                fill="#C51D44"
                stroke="#111111"
                strokeWidth="1.6"
              />
              <path
                d="M62 54.5 C62 54.5 55 49.5 56 45.5 C57 42.5 61 43.5 62 46.5 C63 43.5 67 42.5 68 45.5 C69 49.5 62 54.5 62 54.5 Z"
                fill="#C51D44"
                stroke="#111111"
                strokeWidth="1.6"
              />
            </g>
          ) : null}

          {mood === "broke" ? (
            <g
              ref={pupilsRef}
              data-slot="blobatar-pupils"
              data-pupil-x="0"
              data-pupil-y="0"
              className="poko-blobatar-pupils"
            >
              <path
                d="M33 47 L42 52 M42 47 L33 52"
                stroke="#111111"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M58 47 L67 52 M67 47 L58 52"
                stroke="#111111"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          ) : null}
        </g>

        {/* Mouth by Mood */}
        {mood === "hyped" ? (
          <>
            <path
              d="M41 60 Q50 72 59 60 Z"
              fill="#111111"
              stroke="#111111"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M81 26 L83 30 L87 31 L83 33 L81 37 L79 33 L75 31 L79 30 Z"
              fill="#FFE14D"
              stroke="#111111"
              strokeWidth="1.8"
            />
          </>
        ) : mood === "thinking" ? (
          <path
            d="M44 63 Q50 60 57 63"
            fill="none"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : mood === "broke" ? (
          <>
            <path
              d="M43 64 Q46.5 60 50 64 Q53.5 68 57 64"
              fill="none"
              stroke="#111111"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M74 36 Q79 44 74 47 Q69 44 74 36 Z"
              fill="#5CE1FF"
              stroke="#111111"
              strokeWidth="2.2"
            />
          </>
        ) : mood === "chill" ? (
          <path
            d="M44 62 Q50 66 56 62"
            fill="none"
            stroke="#111111"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M41 61 Q50 70 59 61"
            fill="none"
            stroke="#111111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );

  if (!showFrame) {
    return (
      <span
        data-slot="blobatar-avatar"
        data-seed={spec.normalizedSeed}
        data-frame={frame}
        data-palette={spec.palette.name}
        data-track-cursor={trackCursor ? "true" : "false"}
        className={cn(
          "inline-flex shrink-0 items-center justify-center leading-none",
          interactive && "poko-blobatar-interactive",
          className
        )}
      >
        {svgNode}
      </span>
    );
  }

  return (
    <span
      data-slot="blobatar-avatar"
      data-seed={spec.normalizedSeed}
      data-frame={frame}
      data-palette={spec.palette.name}
      data-track-cursor={trackCursor ? "true" : "false"}
      className={cn(
        "border-ink bg-card inline-flex shrink-0 items-center justify-center leading-none transition-[border-radius,transform,box-shadow] duration-200",
        sizePreset.container,
        sizePreset.border,
        frameRadius,
        interactive && "poko-blobatar-interactive",
        className
      )}
    >
      {svgNode}
    </span>
  );
}
