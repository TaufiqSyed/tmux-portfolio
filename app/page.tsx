"use client";

import Image from "next/image";
import {
  CSSProperties,
  FormEvent,
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
import { profileAnsi } from "./profile-ansi";

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
  opacity: string;
}>;

type TerminalSettings = {
  theme: string;
  video: string;
  opacity: string;
};

type ShellEntry = {
  command?: string;
  lines: string[];
  tone?: "error" | "muted" | "success";
};

type PortraitBlinkFrame = "closed" | "half" | "open";
type ShellProcess = "2048" | "brick" | "mines" | "pong";
type GameDirection = "down" | "left" | "right" | "up";

type GameInput =
  | { type: "flag" }
  | { type: "move"; direction: GameDirection }
  | { type: "reset" }
  | { type: "reveal" };

type GameView = {
  frame: string[];
  hint: string;
  status: string;
  title: string;
};

type ImagePreview = {
  alt: string;
  src: string;
  title: string;
};

type PongState = {
  ballDx: -1 | 1;
  ballDy: -1 | 1;
  ballX: number;
  ballY: number;
  cpuScore: number;
  cpuY: number;
  playerScore: number;
  playerY: number;
};

type MineCell = {
  adjacent: number;
  flagged: boolean;
  mine: boolean;
  revealed: boolean;
};

type MinesState = {
  cells: MineCell[];
  cursorX: number;
  cursorY: number;
  flags: number;
  status: "lost" | "playing" | "won";
};

type BrickState = {
  ballDx: -1 | 1;
  ballDy: -1 | 1;
  ballX: number;
  ballY: number;
  bricks: boolean[];
  lives: number;
  paddleX: number;
  score: number;
  status: "lost" | "playing" | "won";
};

type TilesState = {
  grid: number[];
  score: number;
  status: "playing" | "stuck" | "won";
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

const opacityOptions: SelectOption[] = [
  { id: "0.65", label: "65%" },
  { id: "0.75", label: "75%" },
  { id: "0.85", label: "85%" },
  { id: "0.95", label: "95%" },
  { id: "0.98", label: "98%" },
  { id: "1", label: "100%" },
];

const defaultTerminalSettings: TerminalSettings = {
  opacity: "0.95",
  theme: "catppuccin-mocha",
  video: "blue",
};

const legacyPortfolioAction: {
  href?: string;
  label: string;
  pendingLabel?: string;
} = {
  href: "https://taufiqsyed.vercel.app",
  label: "old portfolio",
  pendingLabel: "old portfolio link pending content",
};

const shellKnownFiles = [
  "about.txt",
  "projects.txt",
  "experience.txt",
  "research.txt",
  "contact.txt",
] as const;

const shellJokes = [
  ["How do robots eat guacamole?", "With computer chips."],
  ["What's the object-oriented way to become wealthy?", "Inheritance."],
  ["Why do programmers prefer dark mode?", "Because light attracts bugs."],
  ["Why do Python programmers wear glasses?", "Because they can't C."],
  [
    "A user interface is like a joke.",
    "If it needs explaining, it is not that good.",
  ],
  [
    "What's the best thing about a Boolean?",
    "Even if it's wrong, it's only off by a bit.",
  ],
  [
    "Why do C# and Java developers keep breaking their keyboards?",
    "Because they use a strongly typed language.",
  ],
  [
    "Why are modern programming languages so materialistic?",
    "Because they are object-oriented.",
  ],
] as const;

const pongBoardWidth = 42;
const pongBoardHeight = 13;
const pongPaddleHeight = 3;
const pongPlayerX = 1;
const pongCpuX = pongBoardWidth - 2;
const minesWidth = 9;
const minesHeight = 7;
const mineCount = 10;
const brickBoardWidth = 42;
const brickBoardHeight = 15;
const brickPaddleWidth = 8;
const brickRows = 4;
const brickColumns = 10;
const tileSize = 4;

type SettingGroupId = keyof TerminalSettings;

const settingGroups: {
  id: SettingGroupId;
  options: SelectOption[] | MediaOption[];
}[] = [
  { id: "theme", options: terminalThemes },
  { id: "video", options: videoOptions },
  { id: "opacity", options: opacityOptions },
];

function hasOption(
  options: SelectOption[] | MediaOption[],
  id: unknown,
): id is string {
  return typeof id === "string" && options.some((option) => option.id === id);
}

function getShellFileLines(fileName: string) {
  const normalizedFile = fileName.toLowerCase();

  if (normalizedFile === "about.txt") {
    return [
      profileContent.name,
      profileContent.headline,
      profileContent.location,
      "",
      profileContent.summary,
    ];
  }

  if (normalizedFile === "projects.txt") {
    return projects.map((project) => `- ${project.name}: ${project.summary}`);
  }

  if (normalizedFile === "experience.txt") {
    return experiences.map(
      (experience) =>
        `- ${experience.title} @ ${experience.organization}: ${experience.summary}`,
    );
  }

  if (normalizedFile === "research.txt") {
    return researchItems.map((research) => `- ${research.title}`);
  }

  if (normalizedFile === "contact.txt") {
    return [
      `email: ${profileContent.email}`,
      `github: ${profileContent.githubUrl}`,
      `linkedin: ${profileContent.linkedinUrl}`,
      `resume: ${profileContent.resumePath}`,
    ];
  }

  return undefined;
}

function shuffleIndexes(length: number) {
  const indexes = Array.from({ length }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

function getShellJoke(
  queuedJokeIndexesRef: { current: number[] },
  lastJokeIndexRef: { current: number | null },
) {
  if (!queuedJokeIndexesRef.current.length) {
    queuedJokeIndexesRef.current = shuffleIndexes(shellJokes.length);
    const lastQueuePosition = queuedJokeIndexesRef.current.length - 1;

    if (
      shellJokes.length > 1 &&
      lastJokeIndexRef.current !== null &&
      queuedJokeIndexesRef.current[lastQueuePosition] === lastJokeIndexRef.current
    ) {
      [
        queuedJokeIndexesRef.current[0],
        queuedJokeIndexesRef.current[lastQueuePosition],
      ] = [
        queuedJokeIndexesRef.current[lastQueuePosition],
        queuedJokeIndexesRef.current[0],
      ];
    }
  }

  const jokeIndex = queuedJokeIndexesRef.current.pop() ?? 0;
  lastJokeIndexRef.current = jokeIndex;

  return shellJokes[jokeIndex];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function createPongState(): PongState {
  return {
    ballDx: -1,
    ballDy: 1,
    ballX: Math.floor(pongBoardWidth / 2),
    ballY: Math.floor(pongBoardHeight / 2),
    cpuScore: 0,
    cpuY: Math.floor((pongBoardHeight - pongPaddleHeight) / 2),
    playerScore: 0,
    playerY: Math.floor((pongBoardHeight - pongPaddleHeight) / 2),
  };
}

function resetPongBall(
  state: PongState,
  direction: -1 | 1,
  score: Pick<PongState, "cpuScore" | "playerScore">,
): PongState {
  return {
    ...state,
    ...score,
    ballDx: direction,
    ballDy: state.ballDy === 1 ? -1 : 1,
    ballX: Math.floor(pongBoardWidth / 2),
    ballY: Math.floor(pongBoardHeight / 2),
  };
}

function advancePongState(state: PongState): PongState {
  const cpuTarget = state.ballY - Math.floor(pongPaddleHeight / 2);
  const cpuY = clamp(
    state.cpuY + Math.sign(cpuTarget - state.cpuY),
    0,
    pongBoardHeight - pongPaddleHeight,
  );
  let ballDx = state.ballDx;
  let ballDy = state.ballDy;
  let ballX = state.ballX + ballDx;
  let ballY = state.ballY + ballDy;

  if (ballY <= 0 || ballY >= pongBoardHeight - 1) {
    ballDy = ballDy === 1 ? -1 : 1;
    ballY = clamp(ballY, 0, pongBoardHeight - 1);
  }

  if (
    ballX === pongPlayerX &&
    ballY >= state.playerY &&
    ballY < state.playerY + pongPaddleHeight
  ) {
    ballDx = 1;
    ballX = pongPlayerX + 1;
  }

  if (
    ballX === pongCpuX &&
    ballY >= cpuY &&
    ballY < cpuY + pongPaddleHeight
  ) {
    ballDx = -1;
    ballX = pongCpuX - 1;
  }

  if (ballX < 0) {
    return resetPongBall(state, 1, {
      cpuScore: state.cpuScore + 1,
      playerScore: state.playerScore,
    });
  }

  if (ballX >= pongBoardWidth) {
    return resetPongBall(state, -1, {
      cpuScore: state.cpuScore,
      playerScore: state.playerScore + 1,
    });
  }

  return {
    ...state,
    ballDx,
    ballDy,
    ballX,
    ballY,
    cpuY,
  };
}

function renderPongFrame(state: PongState) {
  const rows = [`+${"-".repeat(pongBoardWidth)}+`];

  for (let y = 0; y < pongBoardHeight; y += 1) {
    const row: string[] = Array.from({ length: pongBoardWidth }, (_, x) =>
      x === Math.floor(pongBoardWidth / 2) && y % 2 === 0 ? ":" : " ",
    );

    for (let offset = 0; offset < pongPaddleHeight; offset += 1) {
      if (state.playerY + offset === y) {
        row[pongPlayerX] = "#";
      }

      if (state.cpuY + offset === y) {
        row[pongCpuX] = "#";
      }
    }

    if (y === state.ballY) {
      row[state.ballX] = "o";
    }

    rows.push(`|${row.join("")}|`);
  }

  rows.push(`+${"-".repeat(pongBoardWidth)}+`);
  return rows;
}

function createMinesState(): MinesState {
  const totalCells = minesWidth * minesHeight;
  const mineIndexes = new Set<number>();

  while (mineIndexes.size < mineCount) {
    mineIndexes.add(randomInt(totalCells));
  }

  const cells: MineCell[] = Array.from({ length: totalCells }, (_, index) => ({
    adjacent: 0,
    flagged: false,
    mine: mineIndexes.has(index),
    revealed: false,
  }));

  cells.forEach((cell, index) => {
    if (!cell.mine) {
      return;
    }

    const x = index % minesWidth;
    const y = Math.floor(index / minesWidth);

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const nextX = x + dx;
        const nextY = y + dy;

        if (
          nextX >= 0 &&
          nextX < minesWidth &&
          nextY >= 0 &&
          nextY < minesHeight
        ) {
          cells[nextY * minesWidth + nextX].adjacent += 1;
        }
      }
    }
  });

  return {
    cells,
    cursorX: Math.floor(minesWidth / 2),
    cursorY: Math.floor(minesHeight / 2),
    flags: 0,
    status: "playing",
  };
}

function moveMinesCursor(state: MinesState, direction: GameDirection) {
  const delta = {
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
    up: [0, -1],
  }[direction];

  return {
    ...state,
    cursorX: clamp(state.cursorX + delta[0], 0, minesWidth - 1),
    cursorY: clamp(state.cursorY + delta[1], 0, minesHeight - 1),
  };
}

function revealMinesCell(state: MinesState): MinesState {
  if (state.status !== "playing") {
    return state;
  }

  const selectedIndex = state.cursorY * minesWidth + state.cursorX;
  const selectedCell = state.cells[selectedIndex];

  if (selectedCell.flagged || selectedCell.revealed) {
    return state;
  }

  const cells = state.cells.map((cell) => ({ ...cell }));

  if (selectedCell.mine) {
    cells.forEach((cell) => {
      if (cell.mine) {
        cell.revealed = true;
      }
    });
    return { ...state, cells, status: "lost" };
  }

  const queue = [selectedIndex];
  const seen = new Set<number>();

  while (queue.length) {
    const index = queue.shift();

    if (index === undefined || seen.has(index)) {
      continue;
    }

    seen.add(index);
    const cell = cells[index];

    if (cell.flagged || cell.mine) {
      continue;
    }

    cell.revealed = true;

    if (cell.adjacent > 0) {
      continue;
    }

    const x = index % minesWidth;
    const y = Math.floor(index / minesWidth);

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const nextX = x + dx;
        const nextY = y + dy;

        if (
          nextX >= 0 &&
          nextX < minesWidth &&
          nextY >= 0 &&
          nextY < minesHeight
        ) {
          queue.push(nextY * minesWidth + nextX);
        }
      }
    }
  }

  const won = cells.every((cell) => cell.mine || cell.revealed);
  return { ...state, cells, status: won ? "won" : "playing" };
}

function toggleMinesFlag(state: MinesState): MinesState {
  if (state.status !== "playing") {
    return state;
  }

  const selectedIndex = state.cursorY * minesWidth + state.cursorX;
  const selectedCell = state.cells[selectedIndex];

  if (selectedCell.revealed) {
    return state;
  }

  const cells = state.cells.map((cell, index) =>
    index === selectedIndex ? { ...cell, flagged: !cell.flagged } : cell,
  );

  return {
    ...state,
    cells,
    flags: state.flags + (selectedCell.flagged ? -1 : 1),
  };
}

function renderMinesFrame(state: MinesState) {
  const rows = [`+${"-".repeat(minesWidth * 3)}+`];

  for (let y = 0; y < minesHeight; y += 1) {
    const cells = [];

    for (let x = 0; x < minesWidth; x += 1) {
      const cell = state.cells[y * minesWidth + x];
      const isCursor = state.cursorX === x && state.cursorY === y;
      let character = ".";

      if (cell.flagged && state.status !== "lost") {
        character = "F";
      } else if (!cell.revealed) {
        character = ".";
      } else if (cell.mine) {
        character = "*";
      } else if (cell.adjacent > 0) {
        character = String(cell.adjacent);
      } else {
        character = " ";
      }

      cells.push(isCursor ? `[${character}]` : ` ${character} `);
    }

    rows.push(`|${cells.join("")}|`);
  }

  rows.push(`+${"-".repeat(minesWidth * 3)}+`);
  return rows;
}

function createBrickState(): BrickState {
  return {
    ballDx: 1,
    ballDy: -1,
    ballX: Math.floor(brickBoardWidth / 2),
    ballY: brickBoardHeight - 4,
    bricks: Array.from({ length: brickRows * brickColumns }, () => true),
    lives: 3,
    paddleX: Math.floor((brickBoardWidth - brickPaddleWidth) / 2),
    score: 0,
    status: "playing",
  };
}

function moveBrickPaddle(state: BrickState, direction: GameDirection) {
  if (state.status !== "playing") {
    return state;
  }

  const delta = direction === "left" ? -2 : direction === "right" ? 2 : 0;

  return {
    ...state,
    paddleX: clamp(state.paddleX + delta, 0, brickBoardWidth - brickPaddleWidth),
  };
}

function brickIndexAt(x: number, y: number) {
  if (y < 1 || y > brickRows) {
    return undefined;
  }

  const column = Math.floor((x - 1) / 4);

  if (column < 0 || column >= brickColumns) {
    return undefined;
  }

  return (y - 1) * brickColumns + column;
}

function resetBrickBall(state: BrickState, lives: number): BrickState {
  return {
    ...state,
    ballDx: state.ballDx === 1 ? -1 : 1,
    ballDy: -1,
    ballX: Math.floor(brickBoardWidth / 2),
    ballY: brickBoardHeight - 4,
    lives,
    paddleX: Math.floor((brickBoardWidth - brickPaddleWidth) / 2),
    status: lives <= 0 ? "lost" : "playing",
  };
}

function advanceBrickState(state: BrickState): BrickState {
  if (state.status !== "playing") {
    return state;
  }

  const bricks = [...state.bricks];
  let ballDx = state.ballDx;
  let ballDy = state.ballDy;
  let ballX = state.ballX + ballDx;
  let ballY = state.ballY + ballDy;
  let score = state.score;

  if (ballX <= 0 || ballX >= brickBoardWidth - 1) {
    ballDx = ballDx === 1 ? -1 : 1;
    ballX = clamp(ballX, 0, brickBoardWidth - 1);
  }

  if (ballY <= 0) {
    ballDy = 1;
    ballY = 0;
  }

  const brickIndex = brickIndexAt(ballX, ballY);

  if (brickIndex !== undefined && bricks[brickIndex]) {
    bricks[brickIndex] = false;
    ballDy = 1;
    score += 10;
  }

  const paddleY = brickBoardHeight - 1;

  if (
    ballY >= paddleY &&
    ballX >= state.paddleX &&
    ballX < state.paddleX + brickPaddleWidth
  ) {
    ballDy = -1;
    ballY = paddleY - 1;
  }

  if (ballY >= brickBoardHeight) {
    return resetBrickBall({ ...state, bricks, score }, state.lives - 1);
  }

  return {
    ...state,
    ballDx,
    ballDy,
    ballX,
    ballY,
    bricks,
    score,
    status: bricks.every((brick) => !brick) ? "won" : "playing",
  };
}

function renderBrickFrame(state: BrickState) {
  const grid = Array.from({ length: brickBoardHeight }, () =>
    Array.from({ length: brickBoardWidth }, () => " "),
  );

  state.bricks.forEach((exists, index) => {
    if (!exists) {
      return;
    }

    const row = Math.floor(index / brickColumns) + 1;
    const column = index % brickColumns;
    const startX = column * 4 + 1;

    for (let offset = 0; offset < 3; offset += 1) {
      grid[row][startX + offset] = "=";
    }
  });

  grid[state.ballY][state.ballX] = "o";

  for (let offset = 0; offset < brickPaddleWidth; offset += 1) {
    grid[brickBoardHeight - 1][state.paddleX + offset] = "_";
  }

  return [
    `+${"-".repeat(brickBoardWidth)}+`,
    ...grid.map((row) => `|${row.join("")}|`),
    `+${"-".repeat(brickBoardWidth)}+`,
  ];
}

function addRandomTile(grid: number[]) {
  const emptyIndexes = grid
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index >= 0);

  if (!emptyIndexes.length) {
    return grid;
  }

  const nextGrid = [...grid];
  nextGrid[emptyIndexes[randomInt(emptyIndexes.length)]] =
    Math.random() < 0.9 ? 2 : 4;
  return nextGrid;
}

function createTilesState(): TilesState {
  return {
    grid: addRandomTile(addRandomTile(Array.from({ length: 16 }, () => 0))),
    score: 0,
    status: "playing",
  };
}

function slideTilesLine(line: number[]) {
  const values = line.filter(Boolean);
  const merged: number[] = [];
  let score = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const value = values[index] * 2;
      merged.push(value);
      score += value;
      index += 1;
    } else {
      merged.push(values[index]);
    }
  }

  while (merged.length < tileSize) {
    merged.push(0);
  }

  return { line: merged, score };
}

function canMoveTiles(grid: number[]) {
  if (grid.some((value) => value === 0)) {
    return true;
  }

  for (let y = 0; y < tileSize; y += 1) {
    for (let x = 0; x < tileSize; x += 1) {
      const value = grid[y * tileSize + x];
      const right = x < tileSize - 1 ? grid[y * tileSize + x + 1] : undefined;
      const down = y < tileSize - 1 ? grid[(y + 1) * tileSize + x] : undefined;

      if (value === right || value === down) {
        return true;
      }
    }
  }

  return false;
}

function moveTiles(state: TilesState, direction: GameDirection): TilesState {
  if (state.status !== "playing") {
    return state;
  }

  const nextGrid = Array.from({ length: 16 }, () => 0);
  let gainedScore = 0;

  for (let index = 0; index < tileSize; index += 1) {
    const line =
      direction === "left" || direction === "right"
        ? Array.from(
            { length: tileSize },
            (_, x) => state.grid[index * tileSize + x],
          )
        : Array.from(
            { length: tileSize },
            (_, y) => state.grid[y * tileSize + index],
          );
    const shouldReverse = direction === "right" || direction === "down";
    const result = slideTilesLine(shouldReverse ? [...line].reverse() : line);
    const resolvedLine = shouldReverse ? result.line.reverse() : result.line;
    gainedScore += result.score;

    resolvedLine.forEach((value, offset) => {
      if (direction === "left" || direction === "right") {
        nextGrid[index * tileSize + offset] = value;
      } else {
        nextGrid[offset * tileSize + index] = value;
      }
    });
  }

  const moved = nextGrid.some((value, index) => value !== state.grid[index]);

  if (!moved) {
    return state;
  }

  const gridWithTile = addRandomTile(nextGrid);

  return {
    grid: gridWithTile,
    score: state.score + gainedScore,
    status: gridWithTile.some((value) => value >= 2048)
      ? "won"
      : canMoveTiles(gridWithTile)
        ? "playing"
        : "stuck",
  };
}

function renderTilesFrame(state: TilesState) {
  const divider = `+${"------+".repeat(tileSize)}`;
  const rows = [divider];

  for (let y = 0; y < tileSize; y += 1) {
    const cells = [];

    for (let x = 0; x < tileSize; x += 1) {
      const value = state.grid[y * tileSize + x];
      cells.push(String(value || ".").padStart(5, " "));
    }

    rows.push(`|${cells.join(" |") } |`);
    rows.push(divider);
  }

  return rows;
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

function restoreAnsiState(foreground?: string, background?: string) {
  return `${foreground ?? "\x1b[39m"}${background ?? "\x1b[49m"}`;
}

function blinkReplacementForCell(
  column: number,
  row: number,
  frame: PortraitBlinkFrame,
) {
  if (frame === "open") {
    return undefined;
  }

  if (frame === "half") {
    return undefined;
  }

  const leftEyeFill =
    (row === 25 && column >= 22 && column <= 26) ||
    (row === 26 && column >= 21 && column <= 27) ||
    (row === 27 && column >= 23 && column <= 26);
  const rightEyeFill =
    (row === 25 && column >= 37 && column <= 41) ||
    (row === 26 && column >= 36 && column <= 42) ||
    (row === 27 && column >= 37 && column <= 40);
  const leftEyelid = row === 26 && column >= 22 && column <= 26;
  const rightEyelid = row === 26 && column >= 37 && column <= 41;

  if (leftEyelid || rightEyelid) {
    return "\x1b[38;2;92;52;37m-";
  }

  if (leftEyeFill || rightEyeFill) {
    return "\x1b[38;2;185;92;48m8";
  }

  return undefined;
}

function applyPortraitBlinkFrame(input: string, frame: PortraitBlinkFrame) {
  if (frame === "open") {
    return input;
  }

  let output = "";
  let index = 0;
  let column = 0;
  let row = 0;
  let currentForeground: string | undefined;
  let currentBackground: string | undefined;

  while (index < input.length) {
    if (input[index] === "\x1b" && input[index + 1] === "[") {
      const end = input.indexOf("m", index);

      if (end === -1) {
        output += input[index];
        index += 1;
        continue;
      }

      const sequence = input.slice(index, end + 1);
      const codes = input
        .slice(index + 2, end)
        .split(";")
        .filter(Boolean)
        .map((code) => Number.parseInt(code, 10));
      const normalizedCodes = codes.length ? codes : [0];

      for (let codeIndex = 0; codeIndex < normalizedCodes.length; codeIndex += 1) {
        const code = Number.isNaN(normalizedCodes[codeIndex])
          ? 0
          : normalizedCodes[codeIndex];

        if (code === 0) {
          currentForeground = undefined;
          currentBackground = undefined;
        } else if (code === 39) {
          currentForeground = undefined;
        } else if (code === 49) {
          currentBackground = undefined;
        } else if (code === 38 && normalizedCodes[codeIndex + 1] === 2) {
          currentForeground = `\x1b[38;2;${normalizedCodes[codeIndex + 2]};${normalizedCodes[codeIndex + 3]};${normalizedCodes[codeIndex + 4]}m`;
          codeIndex += 4;
        } else if (code === 48 && normalizedCodes[codeIndex + 1] === 2) {
          currentBackground = `\x1b[48;2;${normalizedCodes[codeIndex + 2]};${normalizedCodes[codeIndex + 3]};${normalizedCodes[codeIndex + 4]}m`;
          codeIndex += 4;
        } else if (code === 38 && normalizedCodes[codeIndex + 1] === 5) {
          currentForeground = `\x1b[38;5;${normalizedCodes[codeIndex + 2]}m`;
          codeIndex += 2;
        } else if (code === 48 && normalizedCodes[codeIndex + 1] === 5) {
          currentBackground = `\x1b[48;5;${normalizedCodes[codeIndex + 2]}m`;
          codeIndex += 2;
        } else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) {
          currentForeground = `\x1b[${code}m`;
        } else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) {
          currentBackground = `\x1b[${code}m`;
        }
      }

      output += sequence;
      index = end + 1;
      continue;
    }

    const character = input[index];

    if (character === "\n") {
      output += character;
      column = 0;
      row += 1;
      index += 1;
      continue;
    }

    const replacement = blinkReplacementForCell(column, row, frame);

    if (replacement) {
      output += `${replacement}${restoreAnsiState(currentForeground, currentBackground)}`;
    } else {
      output += character;
    }

    column += 1;
    index += 1;
  }

  return output;
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
  onPreviewImage,
  selectedId,
  onSelect,
}: {
  items: ProjectItem[];
  onPreviewImage: (preview: ImagePreview) => void;
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
            <button
              aria-label={`Open ${selected.name} image preview`}
              className="terminal-image-button"
              onClick={() =>
                onPreviewImage({
                  alt: `${selected.name} preview`,
                  src: selected.fullImageUrl ?? selected.imageUrl ?? "",
                  title: selected.name,
                })
              }
              type="button"
            >
              <Image
                alt={`${selected.name} preview`}
                height={540}
                src={selected.imageUrl}
                style={{ objectPosition: selected.imagePosition ?? "center" }}
                width={960}
              />
            </button>
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
      <div className="pane-scroll-region experience-scroll-region">
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

      <article className="detail-output compact experience-detail">
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
  selectedOpacity,
  selectedTheme,
  selectedVideo,
  setFocusedGroup,
  setSelectedOpacity,
  setSelectedTheme,
  setSelectedVideo,
}: {
  focusedGroup: SettingGroupId;
  selectedOpacity: string;
  selectedTheme: string;
  selectedVideo: string;
  setFocusedGroup: (id: SettingGroupId) => void;
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
      <p className="terminal-note">status: settings persist locally</p>
    </div>
  );
}

function CommandHelpModal({
  mode,
  onClose,
  onDismissOnboarding,
  onOpenShell,
}: {
  mode: "help" | "onboarding";
  onClose: () => void;
  onDismissOnboarding: () => void;
  onOpenShell: () => void;
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
            <span>Ctrl-b :</span>
            <p>open the simulated visitor shell</p>
            <span>Ctrl-c</span>
            <p>interrupt the simulated shell process</p>
            <span>pong</span>
            <p>run terminal Pong inside the shell</p>
            <span>mines / brick / 2048</span>
            <p>run extra terminal arcade games</p>
          </div>
          <div className="command-menu-actions" aria-label="Command actions">
            <button
              className="command-menu-action"
              onClick={onOpenShell}
              type="button"
            >
              open simulated shell
            </button>
            {legacyPortfolioAction.href ? (
              <a
                className="command-menu-action"
                href={legacyPortfolioAction.href}
                rel="noreferrer"
                target="_blank"
              >
                {legacyPortfolioAction.label}
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="command-menu-action is-disabled"
              >
                {legacyPortfolioAction.pendingLabel}
              </span>
            )}
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

function ImagePreviewModal({
  preview,
  onClose,
}: {
  preview: ImagePreview;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop image-preview-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        aria-label={`${preview.title} image preview`}
        aria-modal="true"
        className="mac-help-window image-preview-window"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mac-window-bar">
          <button
            aria-label="Close image preview"
            className="mac-dot mac-dot-red mac-dot-button"
            onClick={onClose}
            type="button"
          />
          <button
            aria-disabled="true"
            aria-label="Minimize disabled"
            className="mac-dot mac-dot-yellow mac-dot-disabled"
            disabled
            type="button"
          />
          <button
            aria-disabled="true"
            aria-label="Zoom disabled"
            className="mac-dot mac-dot-green mac-dot-disabled"
            disabled
            type="button"
          />
        </div>
        <div className="mac-window-body image-preview-body">
          <h2>{preview.title}</h2>
          <div className="image-preview-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={preview.alt}
              className="image-preview-image"
              src={preview.src}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SimulatedShellDrawer({
  entries,
  foregroundProcess,
  gameView,
  input,
  onClose,
  onGameInput,
  onHistoryStep,
  onInputChange,
  onInterrupt,
  onSubmit,
}: {
  entries: ShellEntry[];
  foregroundProcess: ShellProcess | null;
  gameView: GameView | null;
  input: string;
  onClose: () => void;
  onGameInput: (input: GameInput) => void;
  onHistoryStep: (direction: -1 | 1) => void;
  onInputChange: (value: string) => void;
  onInterrupt: () => void;
  onSubmit: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (foregroundProcess) {
      shellRef.current?.focus();
      return;
    }

    inputRef.current?.focus();
  }, [foregroundProcess]);

  useEffect(() => {
    const output = scrollRef.current;

    if (!output) {
      return;
    }

    window.requestAnimationFrame(() => {
      output.scrollTo({
        top: output.scrollHeight,
      });
    });
  }, [entries, foregroundProcess]);

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="shell-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-label="Simulated portfolio shell"
        aria-modal="true"
        className="shell-drawer"
        data-terminal-shell
        onKeyDown={(event) => {
          if (!foregroundProcess) {
            return;
          }

          const key = event.key.toLowerCase();
          const direction =
            event.key === "ArrowUp" || key === "w" || key === "k"
              ? "up"
              : event.key === "ArrowDown" || key === "s" || key === "j"
                ? "down"
                : event.key === "ArrowLeft" || key === "a" || key === "h"
                  ? "left"
                  : event.key === "ArrowRight" || key === "d" || key === "l"
                    ? "right"
                    : null;

          if (event.ctrlKey && key === "c") {
            event.preventDefault();
            onInterrupt();
          } else if (key === "r") {
            event.preventDefault();
            onGameInput({ type: "reset" });
          } else if (
            foregroundProcess === "mines" &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            onGameInput({ type: "reveal" });
          } else if (foregroundProcess === "mines" && key === "f") {
            event.preventDefault();
            onGameInput({ type: "flag" });
          } else if (direction) {
            event.preventDefault();
            onGameInput({ direction, type: "move" });
          }
        }}
        onClick={(event) => event.stopPropagation()}
        ref={shellRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="mac-window-bar">
          <button
            aria-label="Close simulated shell"
            className="mac-dot mac-dot-red mac-dot-button"
            onClick={onClose}
            type="button"
          />
          <span className="mac-dot mac-dot-yellow" />
          <span className="mac-dot mac-dot-green" />
        </div>
        <div className="shell-output" ref={scrollRef}>
          <p className="shell-line shell-line-muted">
            visitor shell - type help for low-risk commands
          </p>
          {entries.map((entry, index) => (
            <div className="shell-entry" key={`${entry.command ?? "boot"}-${index}`}>
              {entry.command ? (
                <p className="shell-line">
                  <span className="shell-prompt">visitor@portfolio</span>
                  <span className="prompt-muted">:~$</span>{" "}
                  <span>{entry.command}</span>
                </p>
              ) : null}
              {entry.lines.map((line, lineIndex) => (
                <p
                  className={`shell-line ${
                    entry.tone ? `shell-line-${entry.tone}` : ""
                  }`}
                  key={`${line}-${lineIndex}`}
                >
                  {line || "\u00a0"}
                </p>
              ))}
            </div>
          ))}
          {foregroundProcess && gameView ? (
            <div
              className="arcade-process"
              role="application"
              aria-label={gameView.title}
            >
              <div className="arcade-status">
                <span>{gameView.title}</span>
                <span>{gameView.status}</span>
              </div>
              <pre className="arcade-board">{gameView.frame.join("\n")}</pre>
              <p className="arcade-hint">{gameView.hint}</p>
            </div>
          ) : null}
        </div>
        {foregroundProcess ? (
          <div className="shell-input-row shell-process-row">
            <span className="shell-prompt">visitor@portfolio:~$</span>
            <span>foreground: {foregroundProcess}</span>
          </div>
        ) : (
          <form className="shell-input-row" onSubmit={submitCommand}>
            <label className="shell-prompt" htmlFor="portfolio-shell-input">
              visitor@portfolio:~$
            </label>
            <input
              autoComplete="off"
              id="portfolio-shell-input"
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.ctrlKey && event.key.toLowerCase() === "c") {
                  event.preventDefault();
                  onInterrupt();
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  onSubmit();
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  onHistoryStep(-1);
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  onHistoryStep(1);
                }
              }}
              ref={inputRef}
              spellCheck={false}
              value={input}
            />
          </form>
        )}
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
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);
  const [isShellOpen, setIsShellOpen] = useState(false);
  const [shellProcess, setShellProcess] = useState<ShellProcess | null>(null);
  const [shellInput, setShellInput] = useState("");
  const [shellEntries, setShellEntries] = useState<ShellEntry[]>([
    {
      lines: [
        "booted portfolio shell",
        "try: help, ls, mines, brick, 2048, pong, joke",
      ],
      tone: "muted",
    },
  ]);
  const [shellHistory, setShellHistory] = useState<string[]>([]);
  const [, setShellHistoryIndex] = useState<number | null>(null);
  const [pongState, setPongState] = useState<PongState>(() =>
    createPongState(),
  );
  const [minesState, setMinesState] = useState<MinesState>(() =>
    createMinesState(),
  );
  const [brickState, setBrickState] = useState<BrickState>(() =>
    createBrickState(),
  );
  const [tilesState, setTilesState] = useState<TilesState>(() =>
    createTilesState(),
  );
  const portrait = profileAnsi;
  const [portraitBlinkFrame, setPortraitBlinkFrame] =
    useState<PortraitBlinkFrame>("open");
  const portraitBlinkTimeoutRef = useRef<number[]>([]);
  const shellGuessTargetRef = useRef(4);
  const queuedJokeIndexesRef = useRef<number[]>([]);
  const lastJokeIndexRef = useRef<number | null>(null);
  const tmuxPrefixRef = useRef(false);

  const selectedTheme = terminalSettings.theme;
  const selectedVideo = terminalSettings.video;
  const selectedOpacity = terminalSettings.opacity;

  const setSelectedTheme = (theme: string) => {
    setTerminalSettings((current) => ({ ...current, theme }));
  };

  const setSelectedVideo = (video: string) => {
    setTerminalSettings((current) => ({ ...current, video }));
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

  const openShell = useCallback(() => {
    setHelpMode(null);
    setIsShellOpen(true);
  }, []);

  const blinkPortrait = useCallback(() => {
    portraitBlinkTimeoutRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });

    setPortraitBlinkFrame("closed");
    portraitBlinkTimeoutRef.current = [
      window.setTimeout(() => {
        setPortraitBlinkFrame("open");
        portraitBlinkTimeoutRef.current = [];
      }, 140),
    ];
  }, []);

  const moveShellHistory = useCallback(
    (direction: -1 | 1) => {
      if (!shellHistory.length) {
        return;
      }

      setShellHistoryIndex((current) => {
        const nextIndex =
          current === null
            ? direction < 0
              ? shellHistory.length - 1
              : 0
            : Math.max(0, Math.min(shellHistory.length - 1, current + direction));

        setShellInput(shellHistory[nextIndex] ?? "");
        return nextIndex;
      });
    },
    [shellHistory],
  );

  const runShellCommand = useCallback(() => {
    const rawCommand = shellInput.trim();

    if (!rawCommand) {
      return;
    }

    if (shellProcess) {
      setShellEntries((current) => [
        ...current,
        {
          command: rawCommand,
          lines: [
            `${shellProcess}: foreground process is running. Ctrl-c to interrupt.`,
          ],
          tone: "error",
        },
      ]);
      setShellInput("");
      return;
    }

    const [commandName = "", ...commandArgs] = rawCommand.split(/\s+/);
    const command = commandName.toLowerCase();
    let nextEntry: ShellEntry | null = null;

    if (command === "clear") {
      setShellEntries([]);
      setShellInput("");
      setShellHistory((current) => [...current, rawCommand]);
      setShellHistoryIndex(null);
      return;
    }

    if (command === "help") {
      nextEntry = {
        command: rawCommand,
        lines: [
          "help              show this menu",
          "pwd               print current folder",
          `ls                list ${shellKnownFiles.length} readable files`,
          "cat <known>       read a known file",
          "mines             run minesweeper",
          "brick             run brick breaker",
          "2048              run terminal 2048",
          "pong              run terminal pong",
          "clear             clear the shell",
          "Ctrl-c            interrupt current process",
          "joke              print a small engineering joke",
          "guess <0-9>       tiny number game",
        ],
      };
    } else if (command === "pwd") {
      nextEntry = {
        command: rawCommand,
        lines: ["~/Portfolio"],
      };
    } else if (command === "ls") {
      nextEntry = {
        command: rawCommand,
        lines: [shellKnownFiles.join("  ")],
      };
    } else if (command === "cat") {
      const fileName = commandArgs[0]?.toLowerCase();
      const fileLines = fileName ? getShellFileLines(fileName) : undefined;

      nextEntry = fileLines
        ? {
            command: rawCommand,
            lines: fileLines,
          }
        : {
            command: rawCommand,
        lines: [
          `cat: ${fileName ?? "<missing>"}: known files are ${shellKnownFiles.join(
                ", ",
              )}`,
          ],
          tone: "error",
        };
    } else if (command === "mines" || command === "minesweeper") {
      setMinesState(createMinesState());
      setShellProcess("mines");
      nextEntry = {
        command: rawCommand,
        lines: [
          "starting minesweeper",
          "move with arrows/hjkl, reveal with space/enter, flag with f, reset with r.",
        ],
        tone: "success",
      };
    } else if (command === "brick" || command === "breakout") {
      setBrickState(createBrickState());
      setShellProcess("brick");
      nextEntry = {
        command: rawCommand,
        lines: [
          "starting brick breaker",
          "move with arrows/a/d/h/l, reset with r, Ctrl-c exits back to shell.",
        ],
        tone: "success",
      };
    } else if (command === "2048" || command === "tiles") {
      setTilesState(createTilesState());
      setShellProcess("2048");
      nextEntry = {
        command: rawCommand,
        lines: [
          "starting 2048",
          "slide with arrows/wasd/hjkl, reset with r, Ctrl-c exits back to shell.",
        ],
        tone: "success",
      };
    } else if (command === "pong") {
      setPongState(createPongState());
      setShellProcess("pong");
      nextEntry = {
        command: rawCommand,
        lines: [
          "starting pong",
          "w/s or arrow keys move your paddle. Ctrl-c exits back to shell.",
        ],
        tone: "success",
      };
    } else if (command === "joke") {
      nextEntry = {
        command: rawCommand,
        lines: [...getShellJoke(queuedJokeIndexesRef, lastJokeIndexRef)],
      };
    } else if (command === "guess") {
      const guess = Number.parseInt(commandArgs[0] ?? "", 10);

      if (!Number.isInteger(guess) || guess < 0 || guess > 9) {
        nextEntry = {
          command: rawCommand,
          lines: ["usage: guess <0-9>"],
          tone: "error",
        };
      } else if (guess === shellGuessTargetRef.current) {
        shellGuessTargetRef.current = Math.floor(Math.random() * 10);
        nextEntry = {
          command: rawCommand,
          lines: ["hit. new number buffered."],
          tone: "success",
        };
      } else {
        nextEntry = {
          command: rawCommand,
          lines: [
            guess < shellGuessTargetRef.current ? "too low" : "too high",
          ],
          tone: "muted",
        };
      }
    } else {
      nextEntry = {
        command: rawCommand,
        lines: [`${commandName}: command not found. try help`],
        tone: "error",
      };
    }

    setShellEntries((current) => (nextEntry ? [...current, nextEntry] : current));
    setShellInput("");
    setShellHistory((current) => [...current, rawCommand]);
    setShellHistoryIndex(null);
  }, [shellInput, shellProcess]);

  const interruptShell = useCallback(() => {
    if (shellProcess) {
      setShellEntries((current) => [
        ...current,
        {
          command: "^C",
          lines: [`${shellProcess} interrupted. shell prompt restored.`],
          tone: "muted",
        },
      ]);
      setShellProcess(null);
      setShellInput("");
      setShellHistoryIndex(null);
      return;
    }

    setShellEntries((current) => [
      ...current,
      {
        command: "^C",
        lines: ["no foreground process"],
        tone: "muted",
      },
    ]);
    setShellInput("");
    setShellHistoryIndex(null);
  }, [shellProcess]);

  const handleGameInput = useCallback(
    (input: GameInput) => {
      if (!shellProcess) {
        return;
      }

      if (input.type === "reset") {
        if (shellProcess === "pong") {
          setPongState(createPongState());
        } else if (shellProcess === "mines") {
          setMinesState(createMinesState());
        } else if (shellProcess === "brick") {
          setBrickState(createBrickState());
        } else if (shellProcess === "2048") {
          setTilesState(createTilesState());
        }

        return;
      }

      if (shellProcess === "pong" && input.type === "move") {
        const delta =
          input.direction === "up" ? -1 : input.direction === "down" ? 1 : 0;

        if (delta) {
          setPongState((current) => ({
            ...current,
            playerY: clamp(
              current.playerY + delta,
              0,
              pongBoardHeight - pongPaddleHeight,
            ),
          }));
        }
      } else if (shellProcess === "mines") {
        if (input.type === "move") {
          setMinesState((current) => moveMinesCursor(current, input.direction));
        } else if (input.type === "reveal") {
          setMinesState((current) => revealMinesCell(current));
        } else if (input.type === "flag") {
          setMinesState((current) => toggleMinesFlag(current));
        }
      } else if (shellProcess === "brick" && input.type === "move") {
        setBrickState((current) => moveBrickPaddle(current, input.direction));
      } else if (shellProcess === "2048" && input.type === "move") {
        setTilesState((current) => moveTiles(current, input.direction));
      }
    },
    [shellProcess],
  );

  const selectedVideoOption =
    videoOptions.find((option) => option.id === selectedVideo) ??
    videoOptions.find(
      (option) => option.id === defaultTerminalSettings.video,
    ) ??
    videoOptions[0];
  const selectedOpacityOption =
    opacityOptions.find((option) => option.id === selectedOpacity) ??
    opacityOptions[2];

  const portraitTokens = useMemo(
    () =>
      parseAnsi(
        applyPortraitBlinkFrame(portrait, portraitBlinkFrame),
        selectedTheme,
      ),
    [portrait, portraitBlinkFrame, selectedTheme],
  );
  const gameView = useMemo<GameView | null>(() => {
    if (shellProcess === "pong") {
      return {
        frame: renderPongFrame(pongState),
        hint: "w/s or arrow keys move paddle. r resets. Ctrl-c exits pong.",
        status: `you:${pongState.playerScore} cpu:${pongState.cpuScore}`,
        title: "pong",
      };
    }

    if (shellProcess === "mines") {
      return {
        frame: renderMinesFrame(minesState),
        hint: "arrows/hjkl move. space/enter reveals. f flags. r resets. Ctrl-c exits.",
        status: `${minesState.status} flags:${minesState.flags}/${mineCount}`,
        title: "minesweeper",
      };
    }

    if (shellProcess === "brick") {
      return {
        frame: renderBrickFrame(brickState),
        hint: "a/d or arrows move. r resets. Ctrl-c exits brick.",
        status: `${brickState.status} score:${brickState.score} lives:${brickState.lives}`,
        title: "brick breaker",
      };
    }

    if (shellProcess === "2048") {
      return {
        frame: renderTilesFrame(tilesState),
        hint: "arrows/wasd/hjkl slide tiles. r resets. Ctrl-c exits.",
        status: `${tilesState.status} score:${tilesState.score}`,
        title: "2048",
      };
    }

    return null;
  }, [brickState, minesState, pongState, shellProcess, tilesState]);
  const shellStyle = useMemo(
    () =>
      ({
        "--terminal-pane-opacity":
          selectedVideo === "none" ? "1" : selectedOpacity,
      }) as CSSProperties,
    [selectedOpacity, selectedVideo],
  );

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
    if (shellProcess !== "pong" && shellProcess !== "brick") {
      return;
    }

    const interval = window.setInterval(() => {
      if (shellProcess === "pong") {
        setPongState((current) => advancePongState(current));
      } else {
        setBrickState((current) => advanceBrickState(current));
      }
    }, shellProcess === "pong" ? 115 : 82);

    return () => window.clearInterval(interval);
  }, [shellProcess]);

  useEffect(() => {
    return () => {
      portraitBlinkTimeoutRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.closest("input, textarea, select") || target.isContentEditable);
      const eventPane =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-pane-id]")?.dataset.paneId
          : undefined;
      const keyboardPane = eventPane ?? activePane;

      if (event.key === "Escape") {
        setShellProcess(null);
        setIsShellOpen(false);
        setImagePreview(null);
        setHelpMode(null);
        tmuxPrefixRef.current = false;
        return;
      }

      if (isShellOpen || helpMode || imagePreview || isTypingTarget) {
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setHelpMode("help");
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

      if (key === ":") {
        event.preventDefault();
        openShell();
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
    imagePreview,
    isShellOpen,
    moveFocusedSettingOption,
    moveFocusedSelection,
    openFocusedSelection,
    openShell,
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
                <button
                  aria-label="Blink pixel portrait"
                  className="portrait-button"
                  onClick={blinkPortrait}
                  type="button"
                >
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
                </button>
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
                onPreviewImage={setImagePreview}
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
                selectedOpacity={selectedOpacity}
                selectedTheme={selectedTheme}
                selectedVideo={selectedVideo}
                setFocusedGroup={setFocusedSettingGroup}
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
            theme:{selectedTheme} video:{selectedVideo} opacity:
            {selectedOpacityOption.label}
          </span>
        </footer>
      </div>

      {helpMode ? (
        <CommandHelpModal
          mode={helpMode}
          onClose={() => setHelpMode(null)}
          onDismissOnboarding={() => {
            window.localStorage.setItem(onboardingStorageKey, "true");
            setHelpMode(null);
          }}
          onOpenShell={openShell}
        />
      ) : null}
      {imagePreview ? (
        <ImagePreviewModal
          onClose={() => setImagePreview(null)}
          preview={imagePreview}
        />
      ) : null}
      {isShellOpen ? (
        <SimulatedShellDrawer
          entries={shellEntries}
          foregroundProcess={shellProcess}
          gameView={gameView}
          input={shellInput}
          onClose={() => {
            setShellProcess(null);
            setIsShellOpen(false);
          }}
          onGameInput={handleGameInput}
          onHistoryStep={moveShellHistory}
          onInputChange={(value) => {
            setShellInput(value);
            setShellHistoryIndex(null);
          }}
          onInterrupt={interruptShell}
          onSubmit={runShellCommand}
        />
      ) : null}
    </main>
  );
}
