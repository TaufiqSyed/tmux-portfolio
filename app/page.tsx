"use client";

import Image from "next/image";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type SelectOption = {
  id: string;
  label: string;
};

type PortfolioItem = {
  id: string;
  name: string;
  summary: string;
  description: string;
  image?: string;
  repoUrl?: string;
  liveUrl?: string;
  tags?: string[];
};

type ExperienceItem = {
  id: string;
  title: string;
  organization: string;
  period: string;
  summary: string;
  description: string;
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

const legacySettingsStorageKey = "taufiq-portfolio-terminal-settings";
const settingsStorageKey = "taufiq-portfolio-terminal-settings-v2";

const terminalThemes: SelectOption[] = [
  { id: "dracula", label: "Dracula" },
  { id: "tokyo-night", label: "Tokyo Night" },
  { id: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { id: "gruvbox", label: "Gruvbox" },
];

const videoOptions: MediaOption[] = [
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
  opacity: "0.85",
  theme: "tokyo-night",
  video: "aurora",
};

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
    window.localStorage.removeItem(legacySettingsStorageKey);
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

const projects: PortfolioItem[] = [
  {
    id: "project-alpha",
    name: "project-alpha",
    summary: "A placeholder project slot for your first featured build.",
    description:
      "Replace this with the full project story, technical context, screenshots, and the reason it belongs in the top set.",
    repoUrl: "https://github.com/",
    liveUrl: "https://example.com/",
    tags: ["next", "systems", "ui"],
  },
  {
    id: "project-beta",
    name: "project-beta",
    summary: "A second project row with room for a concise one-line result.",
    description:
      "This detail area can hold the longer explanation, image, links, stack, and the moment where the work becomes memorable.",
    repoUrl: "https://github.com/",
    tags: ["product", "data"],
  },
  {
    id: "project-gamma",
    name: "project-gamma",
    summary: "A third example entry to show the selected-output behavior.",
    description:
      "The UI is intentionally data-driven, so your real portfolio items can replace these placeholders without layout changes.",
    liveUrl: "https://example.com/",
    tags: ["prototype", "research"],
  },
];

const experiences: ExperienceItem[] = [
  {
    id: "current-role",
    title: "Current Role",
    organization: "Company / Lab",
    period: "2026",
    summary: "Short role summary, impact, or domain.",
    description:
      "Add your real work history here: scope, responsibilities, outcomes, tools, and the sharpest proof of impact.",
  },
  {
    id: "previous-role",
    title: "Previous Role",
    organization: "Organization",
    period: "2024 - 2025",
    summary: "A compact line for the list view.",
    description:
      "Use this selected detail view for expanded role context, achievements, and links if needed.",
  },
  {
    id: "education",
    title: "Education",
    organization: "University / Program",
    period: "Year",
    summary: "Degree, concentration, or focus area.",
    description:
      "Education can live beside experience here, keeping the whole pane scannable and terminal-like.",
  },
];

const researchItems: PortfolioItem[] = [
  {
    id: "research-one",
    name: "research-note-001",
    summary: "A research placeholder for papers, experiments, or essays.",
    description:
      "Use this pane for deeper technical notes, publications, experiments, benchmarks, or reading-driven work.",
    liveUrl: "https://example.com/",
    tags: ["paper", "ml", "notes"],
  },
  {
    id: "research-two",
    name: "research-note-002",
    summary: "Another row showing how research items expand on click.",
    description:
      "Selected research can reveal an image, abstract, status, repo, PDF, or external link depending on what you provide.",
    repoUrl: "https://github.com/",
    tags: ["systems", "analysis"],
  },
];

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
  about: [
    "   _   ___  ___  _   _ _____",
    "  /_\\ | _ )/ _ \\| | | |_   _|",
    " / _ \\| _ \\ (_) | |_| | | |",
    "/_/ \\_\\___/\\___/ \\___/  |_|",
  ].join("\n"),
  background: [
    " ___   _   ___ _  _____ ___ ___  ___  _   _ _  _ ___",
    "| _ ) /_\\ / __| |/ / __| _ \\ _ \\/ _ \\| | | | \\| |   \\",
    "| _ \\/ _ \\ (__| ' < (_ |   /   / (_) | |_| | .` | |) |",
    "|___/_/ \\_\\___|_|\\_\\___|_|_\\_|_\\\\___/ \\___/|_|\\_|___/",
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
        style = { ...style, color: themedPortraitColor(red, green, blue, theme) };
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
      <div className="post-command-line" aria-hidden="true">
        <span className="terminal-cursor" />
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
  icon,
  label,
  options,
  selected,
  onSelect,
}: {
  icon: string;
  label: string;
  options: SelectOption[] | MediaOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="control-row">
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
              onClick={() => onSelect(option.id)}
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

function DetailLinks({ item }: { item: PortfolioItem }) {
  return (
    <div className="detail-links">
      {item.repoUrl ? (
        <a href={item.repoUrl} rel="noreferrer" target="_blank">
          git remote
        </a>
      ) : null}
      {item.liveUrl ? (
        <a href={item.liveUrl} rel="noreferrer" target="_blank">
          open live
        </a>
      ) : null}
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

function PortfolioList({
  items,
  selectedId,
  onSelect,
}: {
  items: PortfolioItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  return (
    <>
      <div className="terminal-list" role="list">
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

      <article className="detail-output">
        <div className="detail-media" aria-label={`${selected.name} preview`}>
          {selected.image ? (
            <Image alt="" fill sizes="320px" src={selected.image} />
          ) : (
            <div className="terminal-preview">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <h3>{selected.name}</h3>
        <p>{selected.description}</p>
        <Tags tags={selected.tags} />
        <DetailLinks item={selected} />
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
      <div className="terminal-list" role="list">
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

      <article className="detail-output compact">
        <p className="detail-period">{selected.period}</p>
        <h3>
          {selected.title} <span>@ {selected.organization}</span>
        </h3>
        <p>{selected.description}</p>
      </article>
    </>
  );
}

export default function Home() {
  const [terminalSettings, setTerminalSettings] =
    useState<TerminalSettings>(defaultTerminalSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [selectedExperience, setSelectedExperience] = useState(
    experiences[0].id,
  );
  const [selectedResearch, setSelectedResearch] = useState(researchItems[0].id);
  const [activePane, setActivePane] = useState("profile");
  const [zoomedPane, setZoomedPane] = useState<string | null>(null);
  const [portrait, setPortrait] = useState(fallbackPortrait);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const selectedVideoOption =
    videoOptions.find((option) => option.id === selectedVideo) ??
    videoOptions.find((option) => option.id === defaultTerminalSettings.video) ??
    videoOptions[0];
  const selectedMusicOption =
    musicOptions.find((option) => option.id === selectedMusic) ?? musicOptions[0];
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
        "--terminal-pane-opacity": selectedOpacity,
      }) as CSSProperties,
    [selectedOpacity],
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

  return (
    <main
      className="portfolio-shell"
      data-theme={selectedTheme}
      style={shellStyle}
    >
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
      <div className="background-scrim" aria-hidden="true" />

      <div className="tmux-window" aria-label="Taufiq Syed tmux portfolio">
        <div className={`tmux-grid ${zoomedPane ? "is-zoomed" : ""}`}>
          <div className="tmux-row tmux-row-top">
            <TmuxPane
              activePane={activePane}
              command="cat ~/Portfolio/profile.ansi"
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
                <div className="control-stack">
                  <ControlRow
                    icon="TH"
                    label="theme"
                    onSelect={setSelectedTheme}
                    options={terminalThemes}
                    selected={selectedTheme}
                  />
                  <ControlRow
                    icon="BG"
                    label="video"
                    onSelect={setSelectedVideo}
                    options={videoOptions}
                    selected={selectedVideo}
                  />
                  <ControlRow
                    icon="OP"
                    label="opacity"
                    onSelect={setSelectedOpacity}
                    options={opacityOptions}
                    selected={selectedOpacity}
                  />
                  <ControlRow
                    icon="AU"
                    label="music"
                    onSelect={setSelectedMusic}
                    options={musicOptions}
                    selected={selectedMusic}
                  />
                </div>
              </div>
            </TmuxPane>

            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.projects}
              command="ls ~/Portfolio/project-list"
              id="projects"
              isZoomed={zoomedPane === "projects"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Projects"
            >
              <PortfolioList
                items={projects}
                onSelect={setSelectedProject}
                selectedId={selectedProject}
              />
            </TmuxPane>

            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.background}
              command="cat ~/Portfolio/experience.log"
              id="background"
              isZoomed={zoomedPane === "background"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Background"
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
              command='grep -R "research" ~/Portfolio'
              id="research"
              isZoomed={zoomedPane === "research"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="Research"
            >
              <PortfolioList
                items={researchItems}
                onSelect={setSelectedResearch}
                selectedId={selectedResearch}
              />
            </TmuxPane>

            <TmuxPane
              activePane={activePane}
              asciiTitle={paneAsciiTitles.about}
              command="cat ~/Portfolio/about.md"
              id="about"
              isZoomed={zoomedPane === "about"}
              onToggleZoom={togglePaneZoom}
              setActivePane={setActivePane}
              title="About"
            >
              <div className="about-output">
                <p>
                  I build interfaces and systems that feel intentional, tactile,
                  and a little cinematic. Your final bio, contact details, and
                  resume links can replace this placeholder.
                </p>
                <div className="about-actions">
                  <a
                    className="profile-action profile-action-resume"
                    download
                    href="/resume/Taufiq-Syed-Resume.txt"
                  >
                    download resume
                  </a>
                  <a
                    className="profile-action profile-action-email"
                    href="mailto:hello@example.com"
                  >
                    email
                  </a>
                  <a
                    className="profile-action profile-action-github"
                    href="https://github.com/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    github
                  </a>
                  <a
                    className="profile-action profile-action-linkedin"
                    href="https://www.linkedin.com/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    linkedin
                  </a>
                </div>
                <div className="terminal-note">
                  status: content placeholders ready for swap
                </div>
              </div>
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
    </main>
  );
}
