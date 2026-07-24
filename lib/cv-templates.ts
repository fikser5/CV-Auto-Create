// Single source of truth for CV visual templates — colors here drive both the
// react-pdf export (lib/cv-pdf.tsx) and the HTML preview (app/cv/[id]/templates.tsx).
// Only the *structure* differs between the two renderers; keep it that way, since
// they otherwise have to be hand-kept in sync (see comments in both files).

export type CvLayout = "sidebar-photo" | "minimal" | "timeline-dark";

export type CvThemeColors = {
  banner: string;
  bannerAccent: string;
  bannerRoleText: string;
  sidebarBg: string;
  heading: string;
  text: string;
  muted: string;
  accent: string;
  barEmpty: string;
};

export type CvTemplate = {
  id: string;
  name: string;
  layout: CvLayout;
  colors: CvThemeColors;
};

export const DEFAULT_TEMPLATE_ID = "classic-teal";

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: "classic-teal",
    name: "Klasyczny",
    layout: "sidebar-photo",
    colors: {
      banner: "#2c4f61",
      bannerAccent: "#3f7188",
      bannerRoleText: "#cfe1e8",
      sidebarBg: "#e9eef1",
      heading: "#2c4f61",
      text: "#242424",
      muted: "#5b6670",
      accent: "#3f7188",
      barEmpty: "#c9d3d8",
    },
  },
  {
    id: "navy-sidebar",
    name: "Korporacyjny",
    layout: "sidebar-photo",
    colors: {
      banner: "#1e3a5f",
      bannerAccent: "#2f5d8a",
      bannerRoleText: "#c7d9ea",
      sidebarBg: "#eaeff5",
      heading: "#1e3a5f",
      text: "#242424",
      muted: "#5b6670",
      accent: "#2f5d8a",
      barEmpty: "#ccd7e2",
    },
  },
  {
    id: "burgundy-sidebar",
    name: "Elegancki",
    layout: "sidebar-photo",
    colors: {
      banner: "#5c2331",
      bannerAccent: "#7f3244",
      bannerRoleText: "#e8d0d5",
      sidebarBg: "#f3e9eb",
      heading: "#5c2331",
      text: "#242424",
      muted: "#5b6670",
      accent: "#7f3244",
      barEmpty: "#ddc6cb",
    },
  },
  {
    id: "forest-sidebar",
    name: "Naturalny",
    layout: "sidebar-photo",
    colors: {
      banner: "#2d4a3a",
      bannerAccent: "#437059",
      bannerRoleText: "#cfe3d7",
      sidebarBg: "#eaf1ec",
      heading: "#2d4a3a",
      text: "#242424",
      muted: "#5b6670",
      accent: "#437059",
      barEmpty: "#c9dbcf",
    },
  },
  {
    id: "slate-timeline",
    name: "Nowoczesny",
    layout: "timeline-dark",
    colors: {
      banner: "#2f3b45",
      bannerAccent: "#4f9cb8",
      bannerRoleText: "#c9d6dc",
      sidebarBg: "#2f3b45",
      heading: "#35586b",
      text: "#242424",
      muted: "#5b6670",
      accent: "#4f9cb8",
      barEmpty: "#47535c",
    },
  },
  {
    id: "rust-timeline",
    name: "Kreatywny",
    layout: "timeline-dark",
    colors: {
      banner: "#5a2f22",
      bannerAccent: "#c96a44",
      bannerRoleText: "#e8cdbf",
      sidebarBg: "#5a2f22",
      heading: "#8a4630",
      text: "#242424",
      muted: "#5b6670",
      accent: "#c96a44",
      barEmpty: "#6b4536",
    },
  },
  {
    id: "plum-timeline",
    name: "Wyrazisty",
    layout: "timeline-dark",
    colors: {
      banner: "#3b1f3d",
      bannerAccent: "#a15b9a",
      bannerRoleText: "#ddc9db",
      sidebarBg: "#3b1f3d",
      heading: "#5c3260",
      text: "#242424",
      muted: "#5b6670",
      accent: "#a15b9a",
      barEmpty: "#57405a",
    },
  },
  {
    id: "charcoal-minimal",
    name: "Minimalistyczny",
    layout: "minimal",
    colors: {
      banner: "#2b2b2b",
      bannerAccent: "#c2703d",
      bannerRoleText: "#e5e5e5",
      sidebarBg: "#f4f4f4",
      heading: "#2b2b2b",
      text: "#242424",
      muted: "#6b6b6b",
      accent: "#c2703d",
      barEmpty: "#dcdcdc",
    },
  },
  {
    id: "sky-minimal",
    name: "Świeży",
    layout: "minimal",
    colors: {
      banner: "#1a5276",
      bannerAccent: "#3498db",
      bannerRoleText: "#d6e4ec",
      sidebarBg: "#eef5fa",
      heading: "#1a5276",
      text: "#242424",
      muted: "#5b6670",
      accent: "#3498db",
      barEmpty: "#d6e4ec",
    },
  },
  {
    id: "olive-minimal",
    name: "Stonowany",
    layout: "minimal",
    colors: {
      banner: "#4a4a2a",
      bannerAccent: "#7a7a3a",
      bannerRoleText: "#e9e8d8",
      sidebarBg: "#f4f3ea",
      heading: "#4a4a2a",
      text: "#242424",
      muted: "#666052",
      accent: "#7a7a3a",
      barEmpty: "#e2e0d0",
    },
  },
];

const TEMPLATE_BY_ID = new Map(CV_TEMPLATES.map((t) => [t.id, t]));

export function getCvTemplate(id: string): CvTemplate {
  return TEMPLATE_BY_ID.get(id) ?? TEMPLATE_BY_ID.get(DEFAULT_TEMPLATE_ID)!;
}

export function isPremiumTemplate(id: string): boolean {
  return id !== DEFAULT_TEMPLATE_ID;
}
