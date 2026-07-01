import {
  LayoutDashboard,
  Users,
  Workflow,
  Mail,
  CalendarDays,
  FileText,
  Phone,
  BarChart3,
  LineChart,
  UsersRound,
  Settings,
  GraduationCap,
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
    ],
  },
  {
    label: "Betrieb",
    items: [
      { label: "Kalender", href: "/calendar", icon: CalendarDays },
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "KI-E-Mail", href: "/email", icon: Mail, badge: "Live" },
      { label: "Spezialisierungen", href: "/specializations", icon: GraduationCap, badge: "Neu" },
      { label: "Dokumente", href: "/documents", icon: FileText },
      { label: "Telefon", href: "/calls", icon: Phone },
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
      { label: "Team", href: "/team", icon: UsersRound },
      { label: "Einstellungen", href: "/settings", icon: Settings },
    ],
  },
];
