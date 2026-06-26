import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Workflow,
  FileText,
  BarChart3,
  LineChart,
  UsersRound,
  Settings,
  Plug,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Überblick",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "KI-Mitarbeiter", href: "/employees", icon: Users },
      { label: "Chat", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    label: "Betrieb",
    items: [
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "Dokumente", href: "/documents", icon: FileText },
    ],
  },
  {
    label: "Intelligenz",
    items: [
      { label: "Analytics & Beratung", href: "/analytics", icon: BarChart3 },
      { label: "Diagramme", href: "/charts", icon: LineChart },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { label: "Integrationen", href: "/integrations", icon: Plug },
      { label: "Team", href: "/team", icon: UsersRound },
      { label: "Einstellungen", href: "/settings", icon: Settings },
    ],
  },
];
