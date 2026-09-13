export const APP_ICON_NAMES = [
  "dashboard",
  "issues",
  "policy",
  "manage",
  "settings",
  "help",
  "logout",
  "menu",
  "search",
  "notification",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "refresh",
  "delete",
  "export",
  "plus",
  "close",
  "check",
  "minus",
  "info",
  "clipboard",
  "removable-media",
  "print",
  "desktop-apps",
  "application-whatsapp",
  "application-signal",
  "application-telegram",
  "application-slack",
  "application-microsoft-teams",
] as const;

export type AppIconName = (typeof APP_ICON_NAMES)[number];

export type AppIconShape =
  | {
      kind: "path";
      d: string;
      fill?: string;
      fillRule?: "evenodd";
      clipRule?: "evenodd";
    }
  | { kind: "circle"; cx: number; cy: number; r: number; fill?: string };

export type AppIconDefinition = {
  viewBox: string;
  body: readonly AppIconShape[];
};

const viewBox = "0 0 32 32";

export const APP_ICON_DEFINITIONS: Record<AppIconName, AppIconDefinition> = {
  dashboard: {
    viewBox,
    body: [
      { kind: "path", d: "M24 21h2v5h-2zm-4-5h2v10h-2zm-9 10a5.006 5.006 0 0 1-5-5h2a3 3 0 1 0 3-3v-2a5 5 0 0 1 0 10" },
      { kind: "path", d: "M28 2H4a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h24a2.003 2.003 0 0 0 2-2V4a2 2 0 0 0-2-2m0 9H14V4h14ZM12 4v7H4V4ZM4 28V13h24l.002 15Z" },
    ],
  },
  issues: {
    viewBox,
    body: [
      { kind: "path", d: "M16 23a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 23m-1-11h2v9h-2z" },
      { kind: "path", d: "M29 30H3a1 1 0 0 1-.887-1.461l13-25a1 1 0 0 1 1.774 0l13 25A1 1 0 0 1 29 30M4.65 28h22.7l.001-.003L16.002 6.17h-.004L4.648 27.997Z" },
    ],
  },
  policy: {
    viewBox,
    body: [
      { kind: "path", d: "M30 18a6 6 0 1 0-10 4.46V30l4-1.893L28 30v-7.54A5.98 5.98 0 0 0 30 18m-4 8.84l-2-.947l-2 .947v-3.19a5.9 5.9 0 0 0 4 0ZM24 22a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4M9 14h7v2H9zm0-6h10v2H9z" },
      { kind: "path", d: "M6 30a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4h-2V4H6v24h10v2Z" },
    ],
  },
  manage: {
    viewBox,
    body: [{ kind: "path", d: "M30 30h-2v-5a5.006 5.006 0 0 0-5-5v-2a7.01 7.01 0 0 1 7 7Zm-8 0h-2v-5a5.006 5.006 0 0 0-5-5H9a5.006 5.006 0 0 0-5 5v5H2v-5a7.01 7.01 0 0 1 7-7h6a7.01 7.01 0 0 1 7 7ZM20 2v2a5 5 0 0 1 0 10v2a7 7 0 0 0 0-14m-8 2a5 5 0 1 1-5 5a5 5 0 0 1 5-5m0-2a7 7 0 1 0 7 7a7 7 0 0 0-7-7" }],
  },
  settings: {
    viewBox,
    body: [
      { kind: "path", d: "M27 16.76v-1.53l1.92-1.68A2 2 0 0 0 29.3 11l-2.36-4a2 2 0 0 0-1.73-1a2 2 0 0 0-.64.1l-2.43.82a11 11 0 0 0-1.31-.75l-.51-2.52a2 2 0 0 0-2-1.61h-4.68a2 2 0 0 0-2 1.61l-.51 2.52a11.5 11.5 0 0 0-1.32.75l-2.38-.86A2 2 0 0 0 6.79 6a2 2 0 0 0-1.73 1L2.7 11a2 2 0 0 0 .41 2.51L5 15.24v1.53l-1.89 1.68A2 2 0 0 0 2.7 21l2.36 4a2 2 0 0 0 1.73 1a2 2 0 0 0 .64-.1l2.43-.82a11 11 0 0 0 1.31.75l.51 2.52a2 2 0 0 0 2 1.61h4.72a2 2 0 0 0 2-1.61l.51-2.52a11.5 11.5 0 0 0 1.32-.75l2.42.82a2 2 0 0 0 .64.1a2 2 0 0 0 1.73-1l2.28-4a2 2 0 0 0-.41-2.51ZM25.21 24l-3.43-1.16a8.9 8.9 0 0 1-2.71 1.57L18.36 28h-4.72l-.71-3.55a9.4 9.4 0 0 1-2.7-1.57L6.79 24l-2.36-4l2.72-2.4a8.9 8.9 0 0 1 0-3.13L4.43 12l2.36-4l3.43 1.16a8.9 8.9 0 0 1 2.71-1.57L13.64 4h4.72l.71 3.55a9.4 9.4 0 0 1 2.7 1.57L25.21 8l2.36 4l-2.72 2.4a8.9 8.9 0 0 1 0 3.13L27.57 20Z" },
      { kind: "path", d: "M16 22a6 6 0 1 1 6-6a5.94 5.94 0 0 1-6 6m0-10a3.91 3.91 0 0 0-4 4a3.91 3.91 0 0 0 4 4a3.91 3.91 0 0 0 4-4a3.91 3.91 0 0 0-4-4" },
    ],
  },
  help: {
    viewBox,
    body: [
      { kind: "path", d: "M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2m0 26a12 12 0 1 1 12-12a12 12 0 0 1-12 12" },
      { kind: "circle", cx: 16, cy: 23.5, r: 1.5 },
      { kind: "path", d: "M17 8h-1.5a4.49 4.49 0 0 0-4.5 4.5v.5h2v-.5a2.5 2.5 0 0 1 2.5-2.5H17a2.5 2.5 0 0 1 0 5h-2v4.5h2V17a4.5 4.5 0 0 0 0-9" },
    ],
  },
  logout: {
    viewBox,
    body: [
      { kind: "path", d: "M6 30h12a2 2 0 0 0 2-2v-3h-2v3H6V4h12v3h2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2" },
      { kind: "path", d: "M20.586 20.586L24.172 17H10v-2h14.172l-3.586-3.586L22 10l6 6l-6 6z" },
    ],
  },
  menu: { viewBox, body: [{ kind: "path", d: "M4 6h24v2H4zm0 9h24v2H4zm0 9h24v2H4z" }] },
  search: { viewBox, body: [{ kind: "path", d: "m29 27.586l-7.552-7.552a11.018 11.018 0 1 0-1.414 1.414L27.586 29ZM4 13a9 9 0 1 1 9 9a9.01 9.01 0 0 1-9-9" }] },
  notification: { viewBox, body: [{ kind: "path", d: "M28.707 19.293L26 16.586V13a10.014 10.014 0 0 0-9-9.95V1h-2v2.05A10.014 10.014 0 0 0 6 13v3.586l-2.707 2.707A1 1 0 0 0 3 20v3a1 1 0 0 0 1 1h7v.777a5.15 5.15 0 0 0 4.5 5.199A5.006 5.006 0 0 0 21 25v-1h7a1 1 0 0 0 1-1v-3a1 1 0 0 0-.293-.707M19 25a3 3 0 0 1-6 0v-1h6Zm8-3H5v-1.586l2.707-2.707A1 1 0 0 0 8 17v-4a8 8 0 0 1 16 0v4a1 1 0 0 0 .293.707L27 20.414Z" }] },
  "chevron-down": { viewBox, body: [{ kind: "path", d: "M16 22L6 12l1.4-1.4l8.6 8.6l8.6-8.6L26 12z" }] },
  "chevron-left": { viewBox, body: [{ kind: "path", d: "M10 16L20 6l1.4 1.4l-8.6 8.6l8.6 8.6L20 26z" }] },
  "chevron-right": { viewBox, body: [{ kind: "path", d: "M22 16L12 26l-1.4-1.4l8.6-8.6l-8.6-8.6L12 6z" }] },
  refresh: { viewBox, body: [{ kind: "path", d: "M12 10H6.78A11 11 0 0 1 27 16h2A13 13 0 0 0 6 7.68V4H4v8h8Zm8 12h5.22A11 11 0 0 1 5 16H3a13 13 0 0 0 23 8.32V28h2v-8h-8Z" }] },
  delete: {
    viewBox,
    body: [
      { kind: "path", d: "M12 12h2v12h-2zm6 0h2v12h-2z" },
      { kind: "path", d: "M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6Zm4 22V8h16v20Zm4-26h8v2h-8z" },
    ],
  },
  export: { viewBox, body: [{ kind: "path", d: "M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4Zm0-10l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10z" }] },
  plus: { viewBox, body: [{ kind: "path", d: "M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z" }] },
  close: { viewBox, body: [{ kind: "path", d: "M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z" }] },
  check: { viewBox, body: [{ kind: "path", d: "m13 24l-9-9l1.414-1.414L13 21.171L26.586 7.586L28 9z" }] },
  minus: { viewBox, body: [{ kind: "path", d: "M8 15h16v2H8z" }] },
  info: {
    viewBox,
    body: [
      { kind: "path", d: "M17 22v-8h-4v2h2v6h-3v2h8v-2zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8" },
      { kind: "path", d: "M16 30a14 14 0 1 1 14-14a14 14 0 0 1-14 14m0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4" },
    ],
  },
  clipboard: {
    viewBox,
    body: [
      { kind: "path", d: "M28 10v18H10V10zm0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2" },
      { kind: "path", d: "M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" },
    ],
  },
  "removable-media": {
    viewBox,
    body: [
      { kind: "path", d: "M24 15V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v9a2 2 0 0 0-2 2v11h2V17h16v11h2V17a2 2 0 0 0-2-2M10 6h12v9H10Z" },
      { kind: "path", d: "M12 10h3v2h-3zm5 0h3v2h-3z" },
    ],
  },
  print: { viewBox, body: [{ kind: "path", d: "M28 9h-3V3H7v6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3v6h18v-6h3a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2M9 5h14v4H9Zm14 22H9V17h14Zm5-6h-3v-6H7v6H4V11h24Z" }] },
  "desktop-apps": {
    viewBox,
    body: [
      { kind: "path", d: "M26 2h4v4h-4zm0 6h4v4h-4zm-6-6h4v4h-4zm0 6h4v4h-4z" },
      { kind: "path", d: "M28 16v6H4V6h12V4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8v4H8v2h16v-2h-4v-4h8a2 2 0 0 0 2-2v-6ZM18 28h-4v-4h4Z" },
    ],
  },
  // The five marks below back the Desktop-apps channel's application picker
  // (Figma "Desktop channel apps selection", 563:10405). That frame draws each
  // app as a checkbox + name only — no logo artwork — so these are simplified,
  // officially-colored placeholders (not exported Figma vectors) pending a
  // brand-asset pass; see docs/FIGMA-DEVIATIONS.md / task-3 report.
  "application-whatsapp": {
    viewBox,
    body: [
      { kind: "circle", cx: 16, cy: 16, r: 14, fill: "#25D366" },
      {
        kind: "path",
        fill: "#FFFFFF",
        d: "M9 8h16a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H16l-5 5v-5h-2a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Z",
      },
    ],
  },
  "application-signal": {
    viewBox,
    body: [
      { kind: "circle", cx: 16, cy: 16, r: 14, fill: "#3A76F0" },
      {
        kind: "path",
        fill: "#FFFFFF",
        d: "M9 8h16a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H16l-5 5v-5h-2a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Z",
      },
    ],
  },
  "application-telegram": {
    viewBox,
    body: [
      { kind: "circle", cx: 16, cy: 16, r: 14, fill: "#29B6F2" },
      { kind: "path", fill: "#FFFFFF", d: "M6 15 27 6l-6 21-4.5-8.5L6 15Zm10.2 3.4 3.3-3.8-7.7-2.4Z" },
    ],
  },
  "application-slack": {
    viewBox,
    body: [
      { kind: "circle", cx: 11, cy: 11, r: 4, fill: "#36C5F0" },
      { kind: "circle", cx: 21, cy: 11, r: 4, fill: "#2EB67D" },
      { kind: "circle", cx: 11, cy: 21, r: 4, fill: "#ECB22E" },
      { kind: "circle", cx: 21, cy: 21, r: 4, fill: "#E01E5A" },
    ],
  },
  "application-microsoft-teams": {
    viewBox,
    body: [
      { kind: "circle", cx: 16, cy: 16, r: 14, fill: "#5059C9" },
      { kind: "path", fill: "#FFFFFF", d: "M9.5 9h13v3h-5v11h-3V12h-5Z" },
    ],
  },
};
