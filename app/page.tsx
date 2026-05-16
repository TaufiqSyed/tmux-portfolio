"use client";

import Image from "next/image";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  educationItems,
  experiences,
  profileContent,
  projects,
  researchItems,
  type EducationItem,
  type ExperienceItem,
  type ProjectItem,
  type ResearchItem,
} from "./portfolio-content";

type SelectOption = {
  id: string;
  label: string;
};

type MediaOption = {
  id: string;
  label: string;
  src?: string;
};

type AnsiToken = {
  text: string;
  style?: CSSProperties;
  className?: string;
};

type StoredSettings = Partial<{
  theme: string;
  video: string;
  music: string;
  opacity: string;
}>;

type TerminalSettings = {
  theme: string;
  video: string;
  music: string;
  opacity: string;
};

type Rgb = {
  red: number;
  green: number;
  blue: number;
};

const legacySettingsStorageKeys = [
  "taufiq-portfolio-terminal-settings",
  "taufiq-portfolio-terminal-settings-v2",
];
const settingsStorageKey = "taufiq-portfolio-terminal-settings-v3";
const onboardingStorageKey = "taufiq-portfolio-hide-command-help";

const terminalThemes: SelectOption[] = [
  { id: "dracula", label: "Dracula" },
  { id: "tokyo-night", label: "Tokyo Night" },
  { id: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { id: "gruvbox", label: "Gruvbox" },
];

const videoOptions: MediaOption[] = [
  { id: "none", label: "None" },
  { id: "blue", label: "Blue", src: "/videos/blue.mp4" },
  { id: "aurora", label: "Aurora", src: "/videos/aurora-drift.mp4" },
];

const musicOptions: MediaOption[] = [
  { id: "none", label: "None" },
  { id: "pulse", label: "Pulse", src: "/audio/pulse.wav" },
  { id: "hum", label: "Hum", src: "/audio/hum.wav" },
  { id: "keys", label: "Keys", src: "/audio/keys.wav" },
];

const opacityOptions: SelectOption[] = [
  { id: "0.65", label: "65%" },
  { id: "0.75", label: "75%" },
  { id: "0.85", label: "85%" },
  { id: "0.95", label: "95%" },
  { id: "0.98", label: "98%" },
  { id: "1", label: "100%" },
];

const defaultTerminalSettings: TerminalSettings = {
  music: "none",
  opacity: "0.95",
  theme: "catppuccin-mocha",
  video: "blue",
};

type SettingGroupId = keyof TerminalSettings;

const settingGroups: {
  id: SettingGroupId;
  options: SelectOption[] | MediaOption[];
}[] = [
  { id: "theme", options: terminalThemes },
  { id: "video", options: videoOptions },
  { id: "opacity", options: opacityOptions },
  { id: "music", options: musicOptions },
];

function hasOption(
  options: SelectOption[] | MediaOption[],
  id: unknown,
): id is string {
  return typeof id === "string" && options.some((option) => option.id === id);
}

function readStoredSettings(): StoredSettings {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(settingsStorageKey);
    legacySettingsStorageKeys.forEach((key) => window.localStorage.removeItem(key));
    return stored ? (JSON.parse(stored) as StoredSettings) : {};
  } catch {
    window.localStorage.removeItem(settingsStorageKey);
    return {};
  }
}

function getInitialTerminalSettings(): TerminalSettings {
  const stored = readStoredSettings();

  return {
    music: hasOption(musicOptions, stored.music)
      ? stored.music
      : defaultTerminalSettings.music,
    opacity: hasOption(opacityOptions, stored.opacity)
      ? stored.opacity
      : defaultTerminalSettings.opacity,
    theme: hasOption(terminalThemes, stored.theme)
      ? stored.theme
      : defaultTerminalSettings.theme,
    video: hasOption(videoOptions, stored.video)
      ? stored.video
      : defaultTerminalSettings.video,
  };
}

const stackedPaneOrder = [
  "profile",
  "projects",
  "experience",
  "research",
  "education",
  "settings",
];

function paneForDirection(
  activePane: string,
  direction: "h" | "j" | "k" | "l",
  isStacked = false,
) {
  if (isStacked) {
    const currentIndex = stackedPaneOrder.indexOf(activePane);
    const safeIndex = currentIndex < 0 ? 0 : currentIndex;

    if (direction === "j") {
      return stackedPaneOrder[(safeIndex + 1) % stackedPaneOrder.length];
    }

    if (direction === "k") {
      return stackedPaneOrder[
        (safeIndex - 1 + stackedPaneOrder.length) % stackedPaneOrder.length
      ];
    }

    return activePane;
  }

  const paneGrid: Record<string, Record<"h" | "j" | "k" | "l", string>> = {
    education: {
      h: "research",
      j: "projects",
      k: "projects",
      l: "settings",
    },
    experience: {
      h: "projects",
      j: "settings",
      k: "settings",
      l: "profile",
    },
    profile: {
      h: "experience",
      j: "research",
      k: "research",
      l: "projects",
    },
    projects: {
      h: "profile",
      j: "education",
      k: "education",
      l: "experience",
    },
    research: {
      h: "settings",
      j: "profile",
      k: "profile",
      l: "education",
    },
    settings: {
      h: "education",
      j: "experience",
      k: "experience",
      l: "research",
    },
  };

  return paneGrid[activePane]?.[direction] ?? activePane;
}

const fallbackPortrait = String.raw`
        .----------------.
       /  .----------.   \
      /  /  terminal  \   \
     |  |   portrait   |  |
     |  |   incoming   |  |
      \  \            /  /
       \  '----------'  /
        '--------------'
`;

const nameAscii = String.raw`
 _____  _    _   _ _____ ___ ___    ______   _______ ____
|_   _|/ \  | | | |  ___|_ _/ _ \  / ___\ \ / / ____|  _ \
  | | / _ \ | | | | |_   | | | | | \___ \\ V /|  _| | | | |
  | |/ ___ \| |_| |  _|  | | |_| |  ___) || | | |___| |_| |
  |_/_/   \_\\___/|_|   |___\__\_\ |____/ |_| |_____|____/
`;

const paneAsciiTitles: Record<string, string> = {
  education: [
    " ___ ___  _   _  ___   _ _____ ___ ___  _  _",
    "| __|   \\| | | |/ __| /_\\_   _|_ _/ _ \\| \\| |",
    "| _|| |) | |_| | (__ / _ \\| |  | | (_) | .` |",
    "|___|___/ \\___/ \\___/_/ \\_\\_| |___\\___/|_|\\_|",
  ].join("\n"),
  experience: [
    " _____  _____ ___ ___ ___ ___ _  _  ___ ___",
    "| __\\ \\/ / _ \\ __| _ \\_ _| __| \\| |/ __| __|",
    "| _| >  <|  _/ _||   /| || _|| .` | (__| _|",
    "|___/_/\\_\\_| |___|_|_\\___|___|_|\\_|\\___|___|",
  ].join("\n"),
  projects: [
    " ___ ___  ___      _ ___ ___ _____ ___",
    "| _ \\ _ \\/ _ \\  _ | | __/ __|_   _/ __|",
    "|  _/   / (_) || || | _| (__  | | \\__ \\",
    "|_| |_|_\\\\___/  \\__/|___\\___| |_| |___/",
  ].join("\n"),
  research: [
    " ___ ___ ___ ___   _   ___  ___ _  _",
    "| _ \\ __/ __| __| /_\\ | _ \\/ __| || |",
    "|   / _|\\__ \\ _| / _ \\|   / (__| __ |",
    "|_|_\\___|___/___/_/ \\_\\_|_\\\\___|_||_|",
  ].join("\n"),
  settings: [
    " ___ ___ _____ _____ ___ _  _  ___ ___",
    "/ __| __|_   _|_   _|_ _| \\| |/ __/ __|",
    "\\__ \\ _|  | |   | |  | || .` | (_ \\__ \\",
    "|___/___| |_|   |_| |___|_|\\_|\\___|___/",
  ].join("\n"),
};

const ansiPalette: Record<number, string> = {
  30: "#0b0f0c",
  31: "#ff6b6b",
  32: "#7dff9f",
  33: "#ffd166",
  34: "#5ea1ff",
  35: "#d783ff",
  36: "#53f5ff",
  37: "#e9fff1",
  90: "#6f7f75",
  91: "#ff8585",
  92: "#9dffb7",
  93: "#ffe08a",
  94: "#8dbdff",
  95: "#e4a8ff",
  96: "#9afaff",
  97: "#ffffff",
};

function colorFromAnsi256(value: number) {
  if (value < 16) {
    const base = [
      "#000000",
      "#800000",
      "#008000",
      "#808000",
      "#000080",
      "#800080",
      "#008080",
      "#c0c0c0",
      "#808080",
      "#ff0000",
      "#00ff00",
      "#ffff00",
      "#0000ff",
      "#ff00ff",
      "#00ffff",
      "#ffffff",
    ];
    return base[value];
  }

  if (value >= 16 && value <= 231) {
    const index = value - 16;
    const red = Math.floor(index / 36);
    const green = Math.floor((index % 36) / 6);
    const blue = index % 6;
    const channel = [red, green, blue].map((entry) =>
      entry === 0 ? 0 : 55 + entry * 40,
    );

    return `rgb(${channel.join(", ")})`;
  }

  const gray = 8 + (value - 232) * 10;
  return `rgb(${gray}, ${gray}, ${gray})`;
}

function luminance(red: number, green: number, blue: number) {
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function isPortraitSkinTone(red: number, green: number, blue: number) {
  return (
    red > 105 &&
    green > 55 &&
    blue > 28 &&
    red > green &&
    green > blue &&
    red - blue > 40
  );
}

function isPortraitShirtTone(red: number, green: number, blue: number) {
  const lightness = luminance(red, green, blue);

  return (
    red < 115 &&
    green < 145 &&
    blue > red + 10 &&
    blue >= green - 8 &&
    lightness > 28 &&
    lightness < 165
  );
}

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");

  return {
    blue: Number.parseInt(value.slice(4, 6), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    red: Number.parseInt(value.slice(0, 2), 16),
  };
}

function mixColor(original: Rgb, tint: Rgb, originalWeight: number) {
  const tintWeight = 1 - originalWeight;
  const red = Math.round(original.red * originalWeight + tint.red * tintWeight);
  const green = Math.round(
    original.green * originalWeight + tint.green * tintWeight,
  );
  const blue = Math.round(
    original.blue * originalWeight + tint.blue * tintWeight,
  );

  return `rgb(${red}, ${green}, ${blue})`;
}

function rgbString(color: Rgb) {
  return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}

const portraitThemeTints: Record<
  string,
  {
    coolShadow: Rgb;
    neutral: Rgb;
    outline: Rgb;
    shirtHighlight: Rgb;
    shirtMid: Rgb;
    shirtShadow: Rgb;
    skinHighlight: Rgb;
    skinMid: Rgb;
    skinShadow: Rgb;
  }
> = {
  "catppuccin-mocha": {
    coolShadow: hexToRgb("#89b4fa"),
    neutral: hexToRgb("#89dceb"),
    outline: hexToRgb("#45475a"),
    shirtHighlight: hexToRgb("#89dceb"),
    shirtMid: hexToRgb("#89b4fa"),
    shirtShadow: hexToRgb("#313244"),
    skinHighlight: hexToRgb("#f9e2af"),
    skinMid: hexToRgb("#a6e3a1"),
    skinShadow: hexToRgb("#89b4fa"),
  },
  dracula: {
    coolShadow: hexToRgb("#bd93f9"),
    neutral: hexToRgb("#8be9fd"),
    outline: hexToRgb("#44475a"),
    shirtHighlight: hexToRgb("#8be9fd"),
    shirtMid: hexToRgb("#6272a4"),
    shirtShadow: hexToRgb("#44475a"),
    skinHighlight: hexToRgb("#f1fa8c"),
    skinMid: hexToRgb("#50fa7b"),
    skinShadow: hexToRgb("#bd93f9"),
  },
  gruvbox: {
    coolShadow: hexToRgb("#fabd2f"),
    neutral: hexToRgb("#83a598"),
    outline: hexToRgb("#504945"),
    shirtHighlight: hexToRgb("#83a598"),
    shirtMid: hexToRgb("#458588"),
    shirtShadow: hexToRgb("#3c3836"),
    skinHighlight: hexToRgb("#fabd2f"),
    skinMid: hexToRgb("#b8bb26"),
    skinShadow: hexToRgb("#d3869b"),
  },
  "tokyo-night": {
    coolShadow: hexToRgb("#bb9af7"),
    neutral: hexToRgb("#7dcfff"),
    outline: hexToRgb("#414868"),
    shirtHighlight: hexToRgb("#7dcfff"),
    shirtMid: hexToRgb("#7aa2f7"),
    shirtShadow: hexToRgb("#292e42"),
    skinHighlight: hexToRgb("#e0af68"),
    skinMid: hexToRgb("#7aa2f7"),
    skinShadow: hexToRgb("#bb9af7"),
  },
};

function themedPortraitColor(
  red: number,
  green: number,
  blue: number,
  theme: string,
) {
  const original = { blue, green, red };
  const lightness = luminance(red, green, blue);
  const tints = portraitThemeTints[theme] ?? portraitThemeTints["tokyo-night"];

  if (isPortraitSkinTone(red, green, blue)) {
    if (lightness > 205) {
      return mixColor(original, tints.skinHighlight, 0.92);
    }

    if (lightness > 145) {
      return mixColor(original, tints.skinMid, 0.9);
    }

    return mixColor(original, tints.skinShadow, 0.88);
  }

  if (isPortraitShirtTone(red, green, blue)) {
    if (lightness > 115) {
      return rgbString(tints.shirtHighlight);
    }

    if (lightness > 62) {
      return rgbString(tints.shirtMid);
    }

    return rgbString(tints.shirtShadow);
  }

  if (lightness < 48) {
    const tint = blue > red + 14 ? tints.coolShadow : tints.outline;
    const originalWeight = lightness < 28 ? 0.76 : 0.82;

    return mixColor(original, tint, originalWeight);
  }

  return mixColor(original, tints.neutral, 0.9);
}

function backgroundColorFromAnsiCode(code: number) {
  if (code >= 40 && code <= 47) {
    return ansiPalette[code - 10];
  }

  if (code >= 100 && code <= 107) {
    return ansiPalette[code - 10];
  }

  return undefined;
}

function parseAnsi(input: string, theme: string): AnsiToken[] {
  const tokens: AnsiToken[] = [];
  const matcher = /\x1b\[([0-9;]*)m/g;
  let cursor = 0;
  let style: CSSProperties = {};
  let className = "";

  const pushText = (end: number) => {
    if (end <= cursor) {
      return;
    }

    tokens.push({
      text: input.slice(cursor, end),
      style: Object.keys(style).length ? { ...style } : undefined,
      className: className || undefined,
    });
  };

  for (const match of input.matchAll(matcher)) {
    pushText(match.index);
    cursor = match.index + match[0].length;

    const codes = match[1]
      ? match[1].split(";").map((code) => Number.parseInt(code, 10))
      : [0];

    for (let index = 0; index < codes.length; index += 1) {
      const code = Number.isNaN(codes[index]) ? 0 : codes[index];

      if (code === 0) {
        style = {};
        className = "";
      } else if (code === 1) {
        className = `${className} ansi-bold`.trim();
      } else if (code === 2) {
        className = `${className} ansi-dim`.trim();
      } else if (code === 22) {
        className = className
          .split(" ")
          .filter((entry) => entry !== "ansi-bold" && entry !== "ansi-dim")
          .join(" ");
      } else if (backgroundColorFromAnsiCode(code)) {
        style = {
          ...style,
          backgroundColor: backgroundColorFromAnsiCode(code),
        };
      } else if (ansiPalette[code]) {
        style = { ...style, color: ansiPalette[code] };
      } else if (code === 39) {
        const nextStyle = { ...style };
        delete nextStyle.color;
        style = nextStyle;
      } else if (code === 49) {
        const nextStyle = { ...style };
        delete nextStyle.backgroundColor;
        style = nextStyle;
      } else if (code === 38 && codes[index + 1] === 5) {
        style = { ...style, color: colorFromAnsi256(codes[index + 2]) };
        index += 2;
      } else if (code === 38 && codes[index + 1] === 2) {
        const [red, green, blue] = codes.slice(index + 2, index + 5);
        style = {
          ...style,
          color: themedPortraitColor(red, green, blue, theme),
        };
        index += 4;
      } else if (code === 48 && codes[index + 1] === 5) {
        style = {
          ...style,
          backgroundColor: colorFromAnsi256(codes[index + 2]),
        };
        index += 2;
      } else if (code === 48 && codes[index + 1] === 2) {
        const [red, green, blue] = codes.slice(index + 2, index + 5);
        style = {
          ...style,
          backgroundColor: themedPortraitColor(red, green, blue, theme),
        };
        index += 4;
      }
    }
  }

  pushText(input.length);
  return tokens;
}

function CommandLine({ command }: { command: string }) {
  return (
    <div className="command-block" aria-label={`Command: ${command}`}>
      <div className="command-line">
        <span className="prompt-user">taufiq@portfolio</span>
        <span className="prompt-muted">:</span>
        <span className="prompt-path">~</span>
        <span className="prompt-muted">$</span>
        <span className="typed-command">{command}</span>
      </div>
    </div>
  );
}

function TmuxPane({
  id,
  title,
  command,
  activePane,
  asciiTitle,
  isZoomed,
  onToggleZoom,
  setActivePane,
  children,
}: {
  id: string;
  title: string;
  command: string;
  activePane: string;
  asciiTitle?: string;
  isZoomed: boolean;
  onToggleZoom: (pane: string) => void;
  setActivePane: (pane: string) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`tmux-pane ${activePane === id ? "is-active" : ""} ${
        isZoomed ? "is-zoomed" : ""
      }`}
      data-pane-id={id}
      onFocusCapture={() => setActivePane(id)}
      onPointerDown={() => setActivePane(id)}
      aria-label={title}
    >
      <div className="pane-titlebar">
        <span>{title}</span>
        <button
          aria-label={isZoomed ? `Unzoom ${title} pane` : `Zoom ${title} pane`}
          aria-pressed={isZoomed}
          className="pane-zoom-toggle"
          onClick={(event) => {
            event.stopPropagation();
            setActivePane(id);
            onToggleZoom(id);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          title={isZoomed ? "unzoom pane" : "zoom pane"}
          type="button"
        >
          {isZoomed ? "[-]" : "[+]"}
        </button>
      </div>
      <div className="pane-body">
        <CommandLine command={command} />
        {asciiTitle ? (
          <pre className="pane-ascii-title" aria-label={title}>
            {asciiTitle.replace(/^\n/, "").replace(/\n$/, "")}
          </pre>
        ) : null}
        <div className="terminal-output">{children}</div>
      </div>
    </section>
  );
}

function ControlRow({
  isFocused = false,
  icon,
  label,
  onFocusRow,
  options,
  selected,
  onSelect,
}: {
  isFocused?: boolean;
  icon: string;
  label: string;
  onFocusRow?: () => void;
  options: SelectOption[] | MediaOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={`control-row ${isFocused ? "is-focused" : ""}`}>
      <span className="control-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="control-label">{label}</span>
      <div className="option-strip">
        {options.map((option) => {
          const isSelected = option.id === selected;

          return (
            <button
              className={`option-token ${isSelected ? "is-selected" : ""}`}
              key={option.id}
              onClick={() => {
                onFocusRow?.();
                onSelect(option.id);
              }}
              onFocus={onFocusRow}
              type="button"
            >
              <span className="radio-dot" aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TerminalLinks({
  links,
}: {
  links: { href?: string; label: string }[];
}) {
  const visibleLinks = links.filter((link) => link.href);

  if (!visibleLinks.length) {
    return null;
  }

  return (
    <div className="detail-links">
      {visibleLinks.map((link) => (
        <a href={link.href} key={link.label} rel="noreferrer" target="_blank">
          {link.label}
        </a>
      ))}
    </div>
  );
}

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div className="tag-line">
      {tags.map((tag) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  );
}

function TerminalBullets({ items }: { items: string[] }) {
  return (
    <ul className="terminal-bullets">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function adjacentItemId<T extends { id: string }>(
  items: T[],
  currentId: string,
  direction: -1 | 1,
) {
  const currentIndex = items.findIndex((item) => item.id === currentId);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;
  const nextIndex = (safeIndex + direction + items.length) % items.length;

  return items[nextIndex]?.id ?? currentId;
}

function ProjectList({
  items,
  selectedId,
  onSelect,
}: {
  items: ProjectItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <>
      <div className="pane-scroll-region">
        <div className="terminal-list terminal-list-readable" role="list">
          {items.map((item) => {
            const isSelected = item.id === selected.id;

            return (
              <button
                className={`terminal-row ${isSelected ? "is-selected" : ""}`}
                key={item.id}
                onClick={() => onSelect(item.id)}
                role="listitem"
                type="button"
              >
                <span className="row-caret">{isSelected ? ">" : " "}</span>
                <span className="row-name">{item.name}</span>
                <span className="row-summary">{item.summary}</span>
              </button>
            );
          })}
        </div>
      </div>

      <article className="detail-output pane-detail-dock">
        <div className="detail-media" aria-label={`${selected.name} preview`}>
          {selected.imageUrl ? (
            <Image
              alt={`${selected.name} preview`}
              height={540}
              src={selected.imageUrl}
              style={{ objectPosition: selected.imagePosition ?? "center" }}
              width={960}
            />
          ) : (
            <div className="terminal-preview">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <p className="detail-kicker">{selected.institution}</p>
        <h3>{selected.name}</h3>
        <TerminalBullets items={selected.bullets} />
        {selected.metrics ? (
          <p className="detail-meta">
            <span>metrics:</span> {selected.metrics}
          </p>
        ) : null}
        <Tags tags={selected.tags} />
        <TerminalLinks
          links={[
            { href: selected.repoUrl, label: "git remote" },
            { href: selected.liveUrl, label: "open live" },
          ]}
        />
      </article>
    </>
  );
}

function ResearchList({
  items,
  selectedId,
  onSelect,
}: {
  items: ResearchItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <>
      <div className="pane-scroll-region">
        <div
          className="terminal-list terminal-list-readable research-list"
          role="list"
        >
          {items.map((item) => {
            const isSelected = item.id === selected.id;

            return (
              <button
                className={`terminal-row ${isSelected ? "is-selected" : ""}`}
                key={item.id}
                onClick={() => onSelect(item.id)}
                role="listitem"
                type="button"
              >
                <span className="row-caret">{isSelected ? ">" : " "}</span>
                <span className="row-name">{item.title}</span>
                <span className="row-summary">
                  {(item.venueShort ?? item.conference).replace(
                    /^IEEE International Conference on /,
                    "IEEE ",
                  )}{" "}
                  / {item.publicationDate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <article className="detail-output compact pane-detail-dock research-detail">
        <div className="research-citation">
          <aside
            className="research-citation-meta"
            aria-label="Publication metadata"
          >
            <div className="paper-rail" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="paper-venue">
              {selected.venueShort ?? selected.conference}
            </p>
            <p className="paper-date">{selected.publicationDate}</p>
            <p className="detail-meta">
              <span>doi:</span> {selected.doi}
            </p>
            <TerminalLinks
              links={[
                { href: selected.publicationUrl, label: "open publication" },
              ]}
            />
          </aside>
          <div className="research-citation-body">
            <h3>{selected.title}</h3>
            <p className="detail-meta compact-text">
              <span>authors:</span> {selected.authors}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}

function ExperienceList({
  items,
  selectedId,
  onSelect,
}: {
  items: ExperienceItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <>
      <div className="pane-scroll-region">
        <div className="terminal-list terminal-list-readable" role="list">
          {items.map((item) => {
            const isSelected = item.id === selected.id;

            return (
              <button
                className={`terminal-row ${isSelected ? "is-selected" : ""}`}
                key={item.id}
                onClick={() => onSelect(item.id)}
                role="listitem"
                type="button"
              >
                <span className="row-caret">{isSelected ? ">" : " "}</span>
                <span className="row-name">{item.title}</span>
                <span className="row-summary">
                  {item.organization} / {item.summary}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <article className="detail-output compact pane-detail-dock">
        <div className="detail-heading">
          {selected.logoUrl ? (
            selected.siteUrl ? (
              <a
                className="detail-logo-link"
                href={selected.siteUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Image
                  alt={`${selected.organization} logo`}
                  className="detail-logo"
                  height={32}
                  src={selected.logoUrl}
                  width={32}
                />
              </a>
            ) : (
              <Image
                alt={`${selected.organization} logo`}
                className="detail-logo"
                height={32}
                src={selected.logoUrl}
                width={32}
              />
            )
          ) : null}
          <h3>
            {selected.title} <span>@ {selected.organization}</span>
          </h3>
        </div>
        <p className="detail-period">{selected.period}</p>
        <p className="detail-meta">
          <span>location:</span> {selected.location}
        </p>
        <TerminalBullets items={selected.details} />
        <TerminalLinks
          links={[{ href: selected.siteUrl, label: "open organization" }]}
        />
      </article>
    </>
  );
}

function EducationList({
  items,
  selectedId,
  onSelect,
}: {
  items: EducationItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <>
      <div className="pane-scroll-region">
        <div className="terminal-list terminal-list-readable" role="list">
          {items.map((item) => {
            const isSelected = item.id === selected.id;

            return (
              <button
                className={`terminal-row ${isSelected ? "is-selected" : ""}`}
                key={item.id}
                onClick={() => onSelect(item.id)}
                role="listitem"
                type="button"
              >
                <span className="row-caret">{isSelected ? ">" : " "}</span>
                <span className="row-name">{item.title}</span>
                <span className="row-summary">{item.summary}</span>
              </button>
            );
          })}
        </div>
      </div>

      <article className="detail-output compact pane-detail-dock education-detail">
        <h3>{selected.title}</h3>
        {selected.meta ? (
          <p className="detail-period">{selected.meta}</p>
        ) : null}
        <p>{selected.summary}</p>
        <TerminalBullets items={selected.details} />
        <Tags tags={selected.tags} />
      </article>
    </>
  );
}

function SettingsPanel({
  focusedGroup,
  selectedMusic,
  selectedOpacity,
  selectedTheme,
  selectedVideo,
  setFocusedGroup,
  setSelectedMusic,
  setSelectedOpacity,
  setSelectedTheme,
  setSelectedVideo,
}: {
  focusedGroup: SettingGroupId;
  selectedMusic: string;
  selectedOpacity: string;
  selectedTheme: string;
  selectedVideo: string;
  setFocusedGroup: (id: SettingGroupId) => void;
  setSelectedMusic: (id: string) => void;
  setSelectedOpacity: (id: string) => void;
  setSelectedTheme: (id: string) => void;
  setSelectedVideo: (id: string) => void;
}) {
  return (
    <div className="settings-output">
      <ControlRow
        isFocused={focusedGroup === "theme"}
        icon="TH"
        label="theme"
        onFocusRow={() => setFocusedGroup("theme")}
        onSelect={setSelectedTheme}
        options={terminalThemes}
        selected={selectedTheme}
      />
      <ControlRow
        isFocused={focusedGroup === "video"}
        icon="BG"
        label="video"
        onFocusRow={() => setFocusedGroup("video")}
        onSelect={setSelectedVideo}
        options={videoOptions}
        selected={selectedVideo}
      />
      <ControlRow
        isFocused={focusedGroup === "opacity"}
        icon="OP"
        label="opacity"
        onFocusRow={() => setFocusedGroup("opacity")}
        onSelect={setSelectedOpacity}
        options={opacityOptions}
        selected={selectedOpacity}
      />
      <ControlRow
        isFocused={focusedGroup === "music"}
        icon="AU"
        label="music"
        onFocusRow={() => setFocusedGroup("music")}
        onSelect={setSelectedMusic}
        options={musicOptions}
        selected={selectedMusic}
      />
      <p className="terminal-note">status: settings persist locally</p>
    </div>
  );
}

function CommandHelpModal({
  mode,
  onClose,
  onDismissOnboarding,
}: {
  mode: "help" | "onboarding";
  onClose: () => void;
  onDismissOnboarding: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-label="Portfolio command help"
        aria-modal="true"
        className="mac-help-window"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mac-window-bar">
          <button
            aria-label="Close command help"
            className="mac-dot mac-dot-red mac-dot-button"
            onClick={onClose}
            type="button"
          />
          <span className="mac-dot mac-dot-yellow" />
          <span className="mac-dot mac-dot-green" />
        </div>
        <div className="mac-window-body">
          <h2>
            {mode === "onboarding"
              ? "Press ? for commands at any time"
              : "Commands"}
          </h2>
          <div className="shortcut-grid">
            <span>?</span>
            <p>open this command menu</p>
            <span>Ctrl-b z</span>
            <p>zoom or unzoom the active pane</p>
            <span>Ctrl-b h/j/k/l</span>
            <p>move between panes, tmux-style</p>
            <span>Ctrl-b r</span>
            <p>open my resume</p>
            <span>Esc</span>
            <p>close modal windows</p>
          </div>
          {mode === "onboarding" ? (
            <button
              className="modal-action"
              onClick={onDismissOnboarding}
              type="button"
            >
              don&apos;t show again
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const [terminalSettings, setTerminalSettings] = useState<TerminalSettings>(
    defaultTerminalSettings,
  );
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [selectedExperience, setSelectedExperience] = useState(
    experiences[0].id,
  );
  const [selectedResearch, setSelectedResearch] = useState(researchItems[0].id);
  const [selectedEducation, setSelectedEducation] = useState(
    educationItems[0].id,
  );
  const [activePane, setActivePane] = useState("profile");
  const [focusedSettingGroup, setFocusedSettingGroup] =
    useState<SettingGroupId>("theme");
  const [zoomedPane, setZoomedPane] = useState<string | null>(null);
  const [helpMode, setHelpMode] = useState<"help" | "onboarding" | null>(null);
  const [portrait, setPortrait] = useState(fallbackPortrait);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tmuxPrefixRef = useRef(false);

  const selectedTheme = terminalSettings.theme;
  const selectedVideo = terminalSettings.video;
  const selectedMusic = terminalSettings.music;
  const selectedOpacity = terminalSettings.opacity;

  const setSelectedTheme = (theme: string) => {
    setTerminalSettings((current) => ({ ...current, theme }));
  };

  const setSelectedVideo = (video: string) => {
    setTerminalSettings((current) => ({ ...current, video }));
  };

  const setSelectedMusic = (music: string) => {
    setTerminalSettings((current) => ({ ...current, music }));
  };

  const setSelectedOpacity = (opacity: string) => {
    setTerminalSettings((current) => ({ ...current, opacity }));
  };

  const togglePaneZoom = (pane: string) => {
    setZoomedPane((current) => (current === pane ? null : pane));
  };

  const moveFocusedSettingOption = useCallback(
    (direction: -1 | 1) => {
      const focusedGroup =
        settingGroups.find((group) => group.id === focusedSettingGroup) ??
        settingGroups[0];

      setTerminalSettings((current) => ({
        ...current,
        [focusedGroup.id]: adjacentItemId(
          focusedGroup.options,
          current[focusedGroup.id],
          direction,
        ),
      }));
    },
    [focusedSettingGroup],
  );

  const moveFocusedSelection = useCallback(
    (direction: -1 | 1, pane = activePane) => {
      if (pane === "projects") {
        setSelectedProject((current) =>
          adjacentItemId(projects, current, direction),
        );
      } else if (pane === "experience") {
        setSelectedExperience((current) =>
          adjacentItemId(experiences, current, direction),
        );
      } else if (pane === "research") {
        setSelectedResearch((current) =>
          adjacentItemId(researchItems, current, direction),
        );
      } else if (pane === "education") {
        setSelectedEducation((current) =>
          adjacentItemId(educationItems, current, direction),
        );
      } else if (pane === "settings") {
        setFocusedSettingGroup(
          (current) =>
            adjacentItemId(settingGroups, current, direction) as SettingGroupId,
        );
      }
    },
    [activePane],
  );

  const openFocusedSelection = useCallback(() => {
    if (activePane === "projects") {
      const project =
        projects.find((item) => item.id === selectedProject) ?? projects[0];
      const href = project.repoUrl ?? project.liveUrl;

      if (href) {
        window.open(href, "_blank", "noreferrer");
      }
    } else if (activePane === "experience") {
      const experience =
        experiences.find((item) => item.id === selectedExperience) ??
        experiences[0];

      if (experience.siteUrl) {
        window.open(experience.siteUrl, "_blank", "noreferrer");
      }
    } else if (activePane === "research") {
      const research =
        researchItems.find((item) => item.id === selectedResearch) ??
        researchItems[0];

      window.open(research.publicationUrl, "_blank", "noreferrer");
    } else if (activePane === "settings") {
      moveFocusedSettingOption(1);
    }
  }, [
    activePane,
    moveFocusedSettingOption,
    selectedExperience,
    selectedProject,
    selectedResearch,
  ]);

  const selectedVideoOption =
    videoOptions.find((option) => option.id === selectedVideo) ??
    videoOptions.find(
      (option) => option.id === defaultTerminalSettings.video,
    ) ??
    videoOptions[0];
  const selectedMusicOption =
    musicOptions.find((option) => option.id === selectedMusic) ??
    musicOptions[0];
  const selectedOpacityOption =
    opacityOptions.find((option) => option.id === selectedOpacity) ??
    opacityOptions[2];

  const portraitTokens = useMemo(
    () => parseAnsi(portrait, selectedTheme),
    [portrait, selectedTheme],
  );
  const shellStyle = useMemo(
    () =>
      ({
        "--terminal-pane-opacity":
          selectedVideo === "none" ? "1" : selectedOpacity,
      }) as CSSProperties,
    [selectedOpacity, selectedVideo],
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/ascii/profile.ansi")
      .then((response) => {
        if (!response.ok) {
          throw new Error("No profile art yet");
        }
        return response.text();
      })
      .then((text) => {
        if (!cancelled && text.trim()) {
          setPortrait(text);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPortrait(fallbackPortrait);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.queueMicrotask(() => {
      if (window.localStorage.getItem(onboardingStorageKey) !== "true") {
        setHelpMode("onboarding");
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    window.queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setTerminalSettings(getInitialTerminalSettings());
      setSettingsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settingsLoaded) {
      return;
    }

    window.localStorage.setItem(
      settingsStorageKey,
      JSON.stringify(terminalSettings),
    );
  }, [settingsLoaded, terminalSettings]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!selectedMusicOption.src) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    audio.src = selectedMusicOption.src;
    audio.loop = true;
    audio.volume = 0.35;
    audio.play().catch(() => {
      audio.pause();
    });
  }, [selectedMusicOption]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const eventPane =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-pane-id]")?.dataset.paneId
          : undefined;
      const keyboardPane = eventPane ?? activePane;

      if (event.key === "?") {
        event.preventDefault();
        setHelpMode("help");
        return;
      }

      if (event.key === "Escape") {
        setHelpMode(null);
        tmuxPrefixRef.current = false;
        return;
      }

      if (helpMode) {
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        tmuxPrefixRef.current = true;
        return;
      }

      if (!tmuxPrefixRef.current) {
        if (keyboardPane === "settings") {
          if (event.key === "ArrowDown" || key === "j") {
            event.preventDefault();
            setActivePane("settings");
            moveFocusedSelection(1, "settings");
          } else if (event.key === "ArrowUp" || key === "k") {
            event.preventDefault();
            setActivePane("settings");
            moveFocusedSelection(-1, "settings");
          } else if (event.key === "ArrowRight" || key === "l") {
            event.preventDefault();
            setActivePane("settings");
            moveFocusedSettingOption(1);
          } else if (event.key === "ArrowLeft" || key === "h") {
            event.preventDefault();
            setActivePane("settings");
            moveFocusedSettingOption(-1);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActivePane("settings");
            moveFocusedSettingOption(1);
          }

          return;
        }

        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowRight" ||
          key === "j"
        ) {
          event.preventDefault();
          moveFocusedSelection(1);
        } else if (
          event.key === "ArrowUp" ||
          event.key === "ArrowLeft" ||
          key === "k"
        ) {
          event.preventDefault();
          moveFocusedSelection(-1);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openFocusedSelection();
        }

        return;
      }

      tmuxPrefixRef.current = false;

      if (key === "z") {
        event.preventDefault();
        setZoomedPane((current) =>
          current === keyboardPane ? null : keyboardPane,
        );
        return;
      }

      if (key === "r") {
        event.preventDefault();
        window.open(profileContent.resumePath, "_blank", "noreferrer");
        return;
      }

      if (key === "?") {
        event.preventDefault();
        setHelpMode("help");
        return;
      }

      if (key === "h" || key === "j" || key === "k" || key === "l") {
        event.preventDefault();
        const sourcePane = zoomedPane ?? keyboardPane;
        const isStacked = window.matchMedia("(max-width: 900px)").matches;
        const nextPane = paneForDirection(sourcePane, key, isStacked);

        setZoomedPane(null);
        setActivePane(nextPane);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activePane,
    helpMode,
    moveFocusedSettingOption,
    moveFocusedSelection,
    openFocusedSelection,
    zoomedPane,
  ]);

  return (
    <main
      className="portfolio-shell"
      data-theme={selectedTheme}
      style={shellStyle}
    >
      {selectedVideoOption.src ? (
        <video
          className="background-video"
          key={selectedVideoOption.src}
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={selectedVideoOption.src}
        />
      ) : null}
      <div className="background-scrim" aria-hidden="true" />

      <div className="tmux-window" aria-label="Taufiq Syed tmux portfolio">
        <div className={`tmux-grid ${zoomedPane ? "is-zoomed" : ""}`}>
          <div className="tmux-row tmux-row-top">
            <TmuxPane
              activePane={activePane}
              command="~/Portfolio/bin/profile --render --controls"
              id="profile"
              isZoomed={zoomedPane === "profile"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Profile"
            >
              <div className="profile-output">
                <pre className="ansi-portrait" aria-label="ASCII portrait">
                  {portraitTokens.map((token, index) => (
                    <span
                      className={token.className}
                      key={`${token.text}-${index}`}
                      style={token.style}
                    >
                      {token.text}
                    </span>
                  ))}
                </pre>
                <pre className="name-gradient" aria-label="TAUFIQ SYED">
                  {nameAscii.replace(/^\n/, "").replace(/\n$/, "")}
                </pre>
                <div className="profile-meta">
                  <p className="profile-headline">{profileContent.headline}</p>
                  <p>
                    <span>based:</span> {profileContent.location} 🇦🇪
                  </p>
                  <p>{profileContent.summary}</p>
                </div>
                <div className="profile-actions">
                  <a
                    className="profile-action profile-action-resume"
                    href={profileContent.resumePath}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="profile-action-icon" aria-hidden="true">
                      
                    </span>
                    <span>resume</span>
                  </a>
                  <a
                    className="profile-action profile-action-email"
                    href={`mailto:${profileContent.email}`}
                  >
                    <span className="profile-action-icon" aria-hidden="true">
                      
                    </span>
                    <span>email</span>
                  </a>
                  <a
                    className="profile-action profile-action-github"
                    href={profileContent.githubUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="profile-action-icon" aria-hidden="true">
                      
                    </span>
                    <span>github</span>
                  </a>
                  <a
                    className="profile-action profile-action-linkedin"
                    href={profileContent.linkedinUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="profile-action-icon" aria-hidden="true">
                      
                    </span>
                    <span>linkedin</span>
                  </a>
                </div>
              </div>
            </TmuxPane>

            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.projects}
              command="~/Portfolio/bin/projects --interactive"
              id="projects"
              isZoomed={zoomedPane === "projects"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Projects"
            >
              <ProjectList
                items={projects}
                onSelect={setSelectedProject}
                selectedId={selectedProject}
              />
            </TmuxPane>

            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.experience}
              command="~/Portfolio/bin/experience --interactive"
              id="experience"
              isZoomed={zoomedPane === "experience"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Experience"
            >
              <ExperienceList
                items={experiences}
                onSelect={setSelectedExperience}
                selectedId={selectedExperience}
              />
            </TmuxPane>
          </div>

          <div className="tmux-row tmux-row-bottom">
            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.research}
              command="~/Portfolio/bin/research --interactive"
              id="research"
              isZoomed={zoomedPane === "research"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Research"
            >
              <ResearchList
                items={researchItems}
                onSelect={setSelectedResearch}
                selectedId={selectedResearch}
              />
            </TmuxPane>

            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.education}
              command="~/Portfolio/bin/education --interactive"
              id="education"
              isZoomed={zoomedPane === "education"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Education"
            >
              <EducationList
                items={educationItems}
                onSelect={setSelectedEducation}
                selectedId={selectedEducation}
              />
            </TmuxPane>

            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.settings}
              command="./settings"
              id="settings"
              isZoomed={zoomedPane === "settings"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Settings"
            >
              <SettingsPanel
                focusedGroup={focusedSettingGroup}
                selectedMusic={selectedMusic}
                selectedOpacity={selectedOpacity}
                selectedTheme={selectedTheme}
                selectedVideo={selectedVideo}
                setFocusedGroup={setFocusedSettingGroup}
                setSelectedMusic={setSelectedMusic}
                setSelectedOpacity={setSelectedOpacity}
                setSelectedTheme={setSelectedTheme}
                setSelectedVideo={setSelectedVideo}
              />
            </TmuxPane>
          </div>
        </div>

        <footer className="tmux-statusbar">
          <span className="status-left">0:bash*</span>
          <span className="status-center">
            {zoomedPane ? `${zoomedPane}:zoom` : activePane}
          </span>
          <span className="status-right">
            theme:{selectedTheme} video:{selectedVideo} audio:
            {selectedMusicOption.label.toLowerCase()} opacity:
            {selectedOpacityOption.label}
          </span>
        </footer>
      </div>

      <audio ref={audioRef} />
      {helpMode ? (
        <CommandHelpModal
          mode={helpMode}
          onClose={() => setHelpMode(null)}
          onDismissOnboarding={() => {
            window.localStorage.setItem(onboardingStorageKey, "true");
            setHelpMode(null);
          }}
        />
      ) : null}
    </main>
  );
}
