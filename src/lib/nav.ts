import {
  LayoutDashboard,
  Users,
  Workflow,
  Mail,
  Inbox,
  CalendarDays,
  ReceiptText,
  FileText,
  Phone,
  BarChart3,
  LineChart,
  UsersRound,
  Settings,
  GraduationCap,
  ShieldCheck,
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

// Kept deliberately short: the six things people use daily sit up top without a
// header, everything advanced is tucked under "Mehr", admin at the bottom.
export const navGroups: NavGroup[] = [
  {
    label: "",
    items: [
      { label: "Start", href: "/dashboard", icon: LayoutDashboard },
      { label: "Posteingang", href: "/inbox", icon: Inbox },
      { label: "Kalender", href: "/calendar", icon: CalendarDays },
      { label: "KI-Mitarbeiter", href: "/employees", icon: Users },
      { label: "Belege", href: "/receipts", icon: ReceiptText },
      { label: "Dokumente", href: "/documents", icon: FileText },
      { label: "Sicherheit", href: "/security", icon: ShieldCheck },
    ],
  },
  {
    label: "Mehr",
    items: [
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "Spezialisierungen", href: "/specializations", icon: GraduationCap },
      { label: "Telefon", href: "/calls", icon: Phone },
      { label: "E-Mail schreiben", href: "/email", icon: Mail },
      { label: "Analyse", href: "/analytics", icon: BarChart3 },
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
