import "./admin-panel-style.css";

import React, {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EventsPanel,
  FinancePanel,
  MatchingPanel,
  MonitoringPanel,
  SecurityPanel,
  type BlueprintApiRequest,
} from "./AdminBlueprintPanels";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CarFront,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  Database,
  FileText,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  MapPin,
  Menu,
  MessageSquare,
  Percent,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  Truck,
  UserCog,
  Users,
  WalletCards,
  X,
} from "lucide-react";

type Screen =
  | "dashboard"
  | "liveOperations"
  | "quickRide"
  | "drivers"
  | "bookings"
  | "customers"
  | "safety"
  | "admins"
  | "roles"
  | "audit"
  | "quickLocations"
  | "setup"
  | "payments"
  | "reports"
  | "pricing"
  | "settings"
  | "support"
  | "notifications"
  | "vehicles"
  | "promotions"
  | "platform"
  | "matching"
  | "events"
  | "finance"
  | "security"
  | "monitoring"
  | "kyc"
  | "routes";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  [key: string]: unknown;
};

type TestDataSummary = Record<string, number>;
type TestDataRecords = {
  customers: any[];
  drivers: any[];
  vehicles: any[];
  bookings: any[];
  locations: any[];
  coupons: any[];
  supportCases: any[];
  notifications: any[];
};

type DashboardData = {
  customers: number;
  drivers: number;
  activeDrivers: number;
  bookings: number;
  completed: number;
  ongoing: number;
  cancelled: number;
  sos: number;
  vehicles: number;
  pendingKyc: number;
  pendingAdmins: number;
  openSupport: number;
};

type DriverLocation = {
  id?: string;
  latitude?: number;
  longitude?: number;
  isOnline?: boolean;
  recordedAt?: string;
};

type Vehicle = {
  id?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  capacity?: number;
  goodsEligible?: boolean;
  status?: string;
};

type Driver = {
  id: string;
  userId?: string;
  fullName?: string;
  verificationStatus?: string;
  driverStatus?: string;
  dailyServiceMode?: string;
  rating?: number;
  totalRides?: number;
  createdAt?: string;
  updatedAt?: string;
  vehicles?: Vehicle[];
  documents?: Array<{
    id: string;
    documentType?: string;
    documentNumber?: string | null;
    fileUrl?: string | null;
    status?: string;
    rejectionReason?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
  payoutProfile?: { status?: string; bankName?: string | null; upiId?: string | null };
  location?: DriverLocation | null;
};

type Customer = {
  id: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id?: string;
    mobile?: string;
    email?: string | null;
    userType?: string;
    status?: string;
  };
  bookings?: Booking[];
  ratings?: unknown[];
  supportCases?: unknown[];
  sosEvents?: unknown[];
};

type BookingLeg = {
  id: string;
  bookingId?: string;
  legNumber?: number;
  status?: string;
  pickupAddress?: string | null;
  dropAddress?: string | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  dropLatitude?: number | null;
  dropLongitude?: number | null;
  assignedDriverId?: string | null;
  vehicleId?: string | null;
  fare?: number | null;
  distanceKm?: number | null;
  durationMinutes?: number | null;
  tripId?: string | null;
  tripPin?: string | null;
  createdAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  connectionPointLabel?: string | null;
  [key: string]: unknown;
};

type Booking = {
  id: string;
  status?: string;
  rideType?: string;
  serviceType?: string;
  pickupAddress?: string | null;
  dropAddress?: string | null;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  dropLatitude?: number | null;
  dropLongitude?: number | null;
  estimatedFare?: number | null;
  finalFare?: number | null;
  totalFare?: number | null;
  customerId?: string;
  assignedDriverId?: string | null;
  vehicleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  scheduledAt?: string | null;
  customer?: {
    id?: string;
    userId?: string;
  } | null;
  assignedDriver?: Driver | null;
  vehicle?: Vehicle | null;
  legs?: BookingLeg[];
  rideRequests?: unknown[];
  payment?: unknown;
  ratings?: unknown[];
  [key: string]: unknown;
};

type SosEvent = {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  bookingId?: string | null;
  incident?: {
    id?: string;
    status?: string;
    severity?: string;
    [key: string]: unknown;
  } | null;
  booking?: {
    id?: string;
    status?: string;
    pickupAddress?: string;
    dropAddress?: string;
  } | null;
  [key: string]: unknown;
};

type AdminUser = {
  id: string;
  userId?: string;
  name?: string;
  roleId?: string;
  approvalStatus?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  suspendedAt?: string | null;
  createdAt?: string;
  role?: Role;
  user?: {
    id?: string;
    userType?: string;
    mobile?: string;
    email?: string | null;
    status?: string;
  };
};

type Permission = {
  id: string;
  module: string;
  action: string;
  [key: string]: unknown;
};

type Role = {
  id: string;
  name: string;
  isSystem?: boolean;
  admins?: Array<{
    id: string;
    name?: string;
    approvalStatus?: string;
  }>;
  permissionLinks?: Array<{
    permission: Permission;
  }>;
  [key: string]: unknown;
};

type AuditLog = {
  id: string;
  action?: string;
  module?: string;
  entityType?: string | null;
  entityId?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  createdAt?: string;
  admin?: {
    id?: string;
    name?: string;
    role?: {
      name?: string;
    };
  } | null;
};

type QuickLocation = {
  id: string;
  name?: string;
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  [key: string]: unknown;
};

type ToastType = "success" | "error" | "info";

type ToastState = {
  type: ToastType;
  message: string;
};

type RealtimeStatus =
  | "offline"
  | "connecting"
  | "connected"
  | "reconnecting";

type RealtimeEventEnvelope = {
  id: string;
  type: string;
  data: unknown;
  receivedAt: string;
};

type SharedRoutePoint = {
  id: string;
  sequence?: number;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  active?: boolean;
};

type SharedRoute = {
  id: string;
  name?: string;
  city?: string | null;
  cityZoneId?: string | null;
  selectionMode?: string | null;
  active?: boolean;
  directionSector?: string | null;
  cityZone?: {
    id?: string;
    name?: string;
    city?: string;
    active?: boolean;
  } | null;
  points?: SharedRoutePoint[];
  [key: string]: unknown;
};


const RIDEX_ADMIN_THEME = `
  :root {
    --bg: #f4f7fb;
    --surface: #ffffff;
    --surface-soft: #f8fafc;
    --border: #e4eaf2;
    --border-strong: #cfd8e6;
    --text: #111a33;
    --muted: #63708a;
    --primary: #08a64f;
    --primary-dark: #07863f;
    --primary-soft: #e9f9f0;
    --success: #0a9f4b;
    --success-soft: #e9f9f0;
    --warning: #f3a500;
    --warning-soft: #fff7df;
    --danger: #ef2b2d;
    --danger-soft: #fff0f1;
    --info: #1777df;
    --info-soft: #eef6ff;
    --radius: 14px;
    --radius-sm: 10px;
    --shadow-sm: 0 3px 14px rgba(14, 29, 58, 0.06);
    --shadow: 0 14px 36px rgba(14, 29, 58, 0.09);
  }

  body {
    background:
      radial-gradient(circle at 0 0, rgba(10, 159, 75, 0.045), transparent 25rem),
      #f4f7fb;
  }

  .login-shell {
    min-height: 100vh;
    padding: 18px;
    background: linear-gradient(135deg, #0d1728 0%, #12233e 48%, #eef4f8 48%, #f8fbfd 100%);
  }

  .login-card {
    width: min(1180px, 100%);
    min-height: 680px;
    padding: 0;
    border: 1px solid rgba(255,255,255,.8);
    border-radius: 18px;
    background: #fff;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1.1fr .9fr;
    box-shadow: 0 28px 80px rgba(2, 12, 30, .22);
  }

  .login-card::before {
    content: "";
    grid-column: 1;
    grid-row: 1 / -1;
    background:
      linear-gradient(180deg, rgba(7,17,32,.5), rgba(7,17,32,.85)),
      radial-gradient(circle at 55% 28%, rgba(255,255,255,.18), transparent 16rem),
      linear-gradient(145deg, #0e1a2f, #0b1323);
  }

  .login-card > .brand-block,
  .login-card > .login-heading,
  .login-card > .login-form,
  .login-card > .login-note {
    grid-column: 2;
  }

  .login-card > .brand-block {
    grid-row: 1;
    align-self: start;
    padding: 38px 42px 0;
    justify-self: stretch;
  }

  .login-card > .brand-block::before {
    content: "Ride";
    color: #111827;
    font-size: 42px;
    font-weight: 950;
    letter-spacing: -0.07em;
  }

  .login-card > .brand-block::after {
    content: "X";
    margin-left: -7px;
    color: #ef2b2d;
    font-size: 42px;
    font-weight: 950;
    font-style: italic;
    letter-spacing: -0.07em;
  }

  .login-card > .brand-block .brand-mark,
  .login-card > .brand-block > div:last-child {
    display: none;
  }

  .login-heading {
    margin: 38px 42px 20px;
  }

  .login-heading h2 {
    font-size: 31px;
    color: #0f1830;
  }

  .login-heading p:not(.eyebrow) {
    color: #5d6b83;
  }

  .eyebrow {
    color: var(--primary);
  }

  .login-form {
    margin: 0 42px;
    gap: 14px;
  }

  .button.primary {
    color: #fff;
    background: linear-gradient(135deg, #0caf55, #078d43);
    box-shadow: 0 9px 18px rgba(8, 166, 79, .18);
  }

  .button.primary:hover:not(:disabled) {
    box-shadow: 0 12px 24px rgba(8, 166, 79, .26);
  }

  .login-note {
    margin: 20px 42px 42px;
    border-color: #cfeede;
    background: #f1fbf5;
  }

  .sidebar {
    width: 208px;
    flex-basis: 208px;
    padding: 16px 10px;
    background:
      radial-gradient(circle at 10% 0, rgba(31, 87, 142, .20), transparent 16rem),
      linear-gradient(180deg, #091528 0%, #07101d 100%);
  }

  .sidebar-brand {
    padding: 4px 10px 18px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    margin-bottom: 10px;
  }

  .sidebar-brand .brand-mark {
    width: auto;
    height: auto;
    flex-basis: auto;
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    color: #fff;
    font-size: 27px;
    letter-spacing: -0.08em;
  }

  .sidebar-brand .brand-mark::after {
    content: "X";
    color: #ef2b2d;
    margin-left: -2px;
    font-style: italic;
  }

  .sidebar-brand strong {
    font-size: 14px;
  }

  .sidebar-brand span {
    color: #91a0bc;
    font-size: 10px;
  }

  .nav-list {
    gap: 3px;
  }

  .nav-item {
    min-height: 37px;
    border-radius: 9px;
    padding: 8px 10px;
    color: #a8b5ca;
    font-size: 11px;
  }

  .nav-item.active {
    background: linear-gradient(90deg, rgba(8,166,79,.95), rgba(8,166,79,.78));
    border-color: rgba(255,255,255,.04);
    box-shadow: none;
  }

  .nav-item:hover {
    background: rgba(255,255,255,.06);
  }

  .main-shell { background: #f7f9fc; }

  .topbar {
    min-height: 64px;
    padding: 10px 22px;
    background: rgba(255,255,255,.97);
  }

  .content {
    padding: 20px 22px 28px;
  }

  .page { width: min(100%, 1500px); }

  .section-header { margin-bottom: 16px; }
  .section-header h2 { font-size: clamp(24px, 2.5vw, 31px); }
  .section-header p { font-size: 12px; }

  .metrics-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }

  .metric-card {
    padding: 13px;
    gap: 10px;
    border-radius: 12px;
  }

  .metric-icon {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
    border-radius: 10px;
    font-size: 17px;
    background: var(--primary-soft);
  }

  .metric-icon-success { background: #e8f8ef; }
  .metric-icon-info { background: #eaf3ff; }
  .metric-icon-warning { background: #fff2d7; }
  .metric-icon-danger { background: #ffe8e9; }
  .metric-icon-neutral { background: #edf1f7; }

  .metric-content span { font-size: 10px; }
  .metric-content strong { font-size: 19px; }

  .panel {
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 3px 13px rgba(14, 29, 58, .055);
  }

  .panel-header { margin-bottom: 12px; }
  .panel-header h3 { font-size: 14px; }
  .panel-header p { margin: 4px 0 0; color: var(--muted); font-size: 11px; }

  .button.secondary:hover:not(:disabled) {
    color: var(--primary-dark);
    border-color: #bfe7cf;
    background: #effaf4;
  }

  .table-wrapper { border-radius: 10px; }
  th { background: #f4f7fb; }
  .table-link { color: #0e74d6; }

  .status.success { background: #e8f8ef; color: #078d43; border-color: #c8efd8; }
  .status.warning { background: #fff6df; color: #a56600; border-color: #f5dd9a; }
  .status.danger { background: #ffe8e9; color: #dc2528; border-color: #ffc8ca; }
  .info-box { margin-top: 14px; padding: 13px; border: 1px solid #d8e8f7; border-radius: 10px; background: #f6fbff; color: #46556f; }
  .info-box p { margin: 5px 0 0; font-size: 12px; line-height: 1.55; }


  @media (max-width: 1100px) {
    .metrics-grid { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .login-card { grid-template-columns: 1fr; }
    .login-card::before { display: none; }
    .login-card > .brand-block,
    .login-card > .login-heading,
    .login-card > .login-form,
    .login-card > .login-note { grid-column: 1; }
  }

  @media (max-width: 820px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      transform: translateX(-102%);
      transition: transform .2s ease;
    }
    .sidebar.mobile-open { transform: translateX(0); }
    .collapse-button { display: none; }
    .metrics-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .content { padding: 14px; }
    .topbar { padding: 10px 14px; }
    .breadcrumb { display: none; }
  }

  @media (max-width: 520px) {
    .metrics-grid { grid-template-columns: 1fr; }
    .login-shell { padding: 10px; }
    .login-card { min-height: 0; }
    .login-card > .brand-block { padding: 26px 22px 0; }
    .login-heading { margin: 28px 22px 16px; }
    .login-form { margin: 0 22px; }
    .login-note { margin: 18px 22px 24px; }
  }
`;

const DEFAULT_API_BASE = (
  (import.meta as any)?.env?.VITE_RIDEX_API_URL ||
  "http://localhost:4000/api/v1"
).replace(/\/+$/, "");

/**
 * RideX integration contract:
 * Admin, Driver and Customer are backend-connected applications.
 * Configure VITE_RIDEX_API_URL for local/staging/production without changing
 * this file. Optional integrations remain placeholders and do not block UI.
 */
const RIDEX_OPTIONAL_CONFIG = {
  mapsUrl: (import.meta as any)?.env?.VITE_RIDEX_MAPS_URL || "",
  paymentsUrl: (import.meta as any)?.env?.VITE_RIDEX_PAYMENTS_URL || "",
  notificationsUrl: (import.meta as any)?.env?.VITE_RIDEX_NOTIFICATIONS_URL || "",
};

const ADMIN_ID_STORAGE_KEY = "ridex_admin_user_id";
const ADMIN_AUTH_TOKEN_STORAGE_KEY = "ridex_admin_auth_token_v1";
const RIDEX_TEST_MODE = String((import.meta as any)?.env?.VITE_RIDEX_TEST_MODE ?? "false").toLowerCase() === "true";
const ADMIN_LOGIN_PURPOSE = "ADMIN.AUTH.LOGIN";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  dashboard: LayoutDashboard, map: MapPin, list: ListChecks, users: Users, driver: CarFront, vehicle: Truck,
  payment: CreditCard, chart: BarChart3, plus: Plus, percent: Percent, promo: Percent, support: LifeBuoy, safety: ShieldAlert,
  notifications: Bell, admin: UserCog, roles: LockKeyhole, audit: ClipboardList, settings: Settings, setup: Gauge,
  refresh: RefreshCw, close: X, alert: AlertTriangle, activity: Activity, check: CheckCircle2, wallet: WalletCards, database: Database,
  file: FileText, receipt: ClipboardList, route: MapPin, clock: Clock3, message: MessageSquare, menu: Menu
};

function AppIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? Activity;
  return <Icon size={size} strokeWidth={1.9} aria-hidden="true" />;
}

const NAV_ITEMS: Array<{
  id: Screen;
  label: string;
  icon: string;
}> = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "liveOperations", label: "Live Operations", icon: "map" },
  { id: "matching", label: "Matching Operations", icon: "activity" },
  { id: "events", label: "Events / Sessions", icon: "clock" },
  { id: "finance", label: "Finance / Settlements", icon: "wallet" },
  { id: "security", label: "Security Center", icon: "roles" },
  { id: "monitoring", label: "Monitoring / Recovery", icon: "database" },
  { id: "bookings", label: "Rides", icon: "list" },
  { id: "customers", label: "Users / Customers", icon: "users" },
  { id: "drivers", label: "Drivers", icon: "driver" },
  { id: "kyc", label: "KYC / Documents", icon: "file" },
  { id: "vehicles", label: "Vehicles / E-Rickshaws", icon: "vehicle" },
  { id: "payments", label: "Payments", icon: "payment" },
  { id: "reports", label: "Reports & Analytics", icon: "chart" },
  { id: "pricing", label: "Pricing & Commission", icon: "percent" },
  { id: "quickLocations", label: "Quick Locations", icon: "map" },
  { id: "routes", label: "Shared Ride Routes", icon: "route" },
  { id: "promotions", label: "Promotions", icon: "promo" },
  { id: "support", label: "Support & Disputes", icon: "support" },
  { id: "safety", label: "Safety / SOS", icon: "safety" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "admins", label: "Admin Users", icon: "admin" },
  { id: "roles", label: "Roles & Permissions", icon: "roles" },
  { id: "audit", label: "Audit Logs", icon: "audit" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "setup", label: "Test Setup", icon: "setup" },
  { id: "platform", label: "Test / Live Control", icon: "activity" },
];

const VERIFICATION_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
];

const DRIVER_STATUSES = [
  "OFFLINE",
  "ONLINE",
  "ON_TRIP",
  "SUSPENDED",
];

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "OPERATIONS",
  "FINANCE",
  "SAFETY",
  "SUPPORT",
  "VERIFICATION_KYC",
];

function getStoredAdminId() {
  try {
    return (
      localStorage.getItem(ADMIN_ID_STORAGE_KEY) ?? ""
    );
  } catch {
    return "";
  }
}

function saveStoredAdminId(value: string) {
  try {
    if (value.trim()) {
      localStorage.setItem(
        ADMIN_ID_STORAGE_KEY,
        value.trim()
      );
    } else {
      localStorage.removeItem(ADMIN_ID_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures.
  }
}


function getStoredAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveStoredAdminToken(value: string) {
  try {
    if (value.trim()) {
      sessionStorage.setItem(ADMIN_AUTH_TOKEN_STORAGE_KEY, value.trim());
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures.
  }
}

function formatNumber(value: unknown) {
  const number = Number(value ?? 0);
  return Number.isFinite(number)
    ? number.toLocaleString("en-IN")
    : "0";
}

function formatMoney(value: unknown) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return "₹0";
  return `₹${number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: unknown) {
  if (!value) return "—";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shortId(value: unknown, length = 14) {
  const text = String(value ?? "");
  if (!text) return "—";
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

function displayValue(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[object]";
    }
  }

  return String(value);
}

function humanize(value: unknown) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(value: unknown) {
  const text = String(value ?? "")
    .toLowerCase()
    .replaceAll("_", "-");

  if (
    [
      "approved",
      "completed",
      "online",
      "active",
      "in-progress",
      "driver-assigned",
    ].includes(text)
  ) {
    return "status success";
  }

  if (
    [
      "pending",
      "matching",
      "driver-arriving",
      "driver-arrived",
      "under-review",
      "open",
      "at-risk",
    ].includes(text)
  ) {
    return "status warning";
  }

  if (
    [
      "rejected",
      "cancelled",
      "suspended",
      "failed",
      "closed",
    ].includes(text)
  ) {
    return "status danger";
  }

  return "status neutral";
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value)
    ? (value as T[])
    : [];
}

async function readResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  let json: ApiResponse<T> | null = null;

  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    json = null;
  }

  if (!response.ok) {
    throw new Error(
      String(
        json?.message ??
          json?.error ??
          `Request failed (${response.status})`
      )
    );
  }

  return (
    json ?? {
      success: true,
      data: undefined,
    }
  );
}


function Panel({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || subtitle || actions) ? (
        <div className="panel-header">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="section-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function StatusBadge({ value }: { value: unknown }) {
  return <Badge value={value} />;
}

function ConfirmationModal({
  title,
  description,
  expectedText,
  value,
  setValue,
  onCancel,
  onConfirm,
  loading,
}: {
  title: string;
  description: string;
  expectedText: string;
  value: string;
  setValue: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const matches =
    value.trim().toUpperCase() ===
    expectedText.toUpperCase();

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">High-risk confirmation</p>
            <h3>{title}</h3>
          </div>
          <button
            className="icon-button"
            onClick={onCancel}
            type="button"
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p>{description}</p>

          <label className="field-label">
            Type exactly:
          </label>

          <div className="confirmation-token">
            {expectedText}
          </div>

          <input
            className="text-input"
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder={expectedText}
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button
            className="button secondary"
            onClick={onCancel}
            type="button"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="button danger-button"
            onClick={onConfirm}
            type="button"
            disabled={!matches || loading}
          >
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Drawer({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="drawer-backdrop">
      <aside className="drawer">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Details</p>
            <h2>{title}</h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="drawer-content">
          {children}
        </div>
      </aside>
    </div>
  );
}

function JsonBlock({
  value,
}: {
  value: unknown;
}) {
  let text = "—";

  try {
    text = JSON.stringify(
      value,
      null,
      2
    );
  } catch {
    text = String(value ?? "—");
  }

  return (
    <pre className="json-block">
      {text}
    </pre>
  );
}

function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">∅</div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function LoadingState({
  message = "Loading…",
}: {
  message?: string;
}) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state">
      <div className="error-icon">!</div>
      <div>
        <strong>Could not load data</strong>
        <p>{message}</p>
      </div>

      {onRetry ? (
        <button
          className="button secondary small"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  onRefresh,
  right,
  actions,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  right?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? (
          <p>{subtitle}</p>
        ) : null}
      </div>

      <div className="section-actions">
        {onRefresh ? (
          <button
            className="button secondary"
            onClick={onRefresh}
            type="button"
          >
            ↻ Refresh
          </button>
        ) : null}

        {right}
        {actions}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  onClick,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  icon: string;
  onClick?: () => void;
  tone?: "primary" | "success" | "info" | "warning" | "danger" | "neutral";
}) {
  return (
    <button
      type="button"
      className={`metric-card ${
        onClick ? "clickable" : ""
      }`}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className={`metric-icon metric-icon-${tone}`}><AppIcon name={icon} size={20} /></div>
      <div className="metric-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </button>
  );
}

function Badge({
  value,
}: {
  value: unknown;
}) {
  return (
    <span className={statusClass(value)}>
      {humanize(value)}
    </span>
  );
}

function PaginationInfo({
  count,
}: {
  count: number;
}) {
  return (
    <div className="table-meta">
      Showing {formatNumber(count)} record
      {count === 1 ? "" : "s"}
    </div>
  );
}


function LiveOperationsMap({
  drivers,
  bookings,
  onDriverClick,
}: {
  drivers: Driver[];
  bookings: Booking[];
  onDriverClick: (driverId: string) => void;
}) {
  const onlineDrivers = drivers
    .filter((driver) =>
      ["ONLINE", "ON_TRIP"].includes(
        String(driver.driverStatus ?? "").toUpperCase(),
      ),
    )
    .filter(
      (driver) =>
        Number.isFinite(driver.location?.latitude) &&
        Number.isFinite(driver.location?.longitude),
    )
    .slice(0, 18);

  const activeStatuses = new Set([
    "MATCHING",
    "DRIVER_ASSIGNED",
    "DRIVER_ARRIVING",
    "DRIVER_ARRIVED",
    "STARTED",
    "IN_PROGRESS",
    "AT_RISK",
  ]);

  const activeBookings = bookings
    .filter((booking) =>
      activeStatuses.has(String(booking.status ?? "").toUpperCase()),
    )
    .slice(0, 12);

  const points: Array<{ lat: number; lng: number }> = [];

  for (const driver of onlineDrivers) {
    const lat = Number(driver.location?.latitude);
    const lng = Number(driver.location?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      points.push({ lat, lng });
    }
  }

  for (const booking of activeBookings) {
    const pickupLat = Number(booking.pickupLatitude);
    const pickupLng = Number(booking.pickupLongitude);
    const dropLat = Number(booking.dropLatitude);
    const dropLng = Number(booking.dropLongitude);

    if (Number.isFinite(pickupLat) && Number.isFinite(pickupLng)) {
      points.push({ lat: pickupLat, lng: pickupLng });
    }
    if (Number.isFinite(dropLat) && Number.isFinite(dropLng)) {
      points.push({ lat: dropLat, lng: dropLng });
    }

    for (const leg of safeArray<BookingLeg>(booking.legs)) {
      const legPickupLat = Number(leg.pickupLatitude);
      const legPickupLng = Number(leg.pickupLongitude);
      const legDropLat = Number(leg.dropLatitude);
      const legDropLng = Number(leg.dropLongitude);
      if (Number.isFinite(legPickupLat) && Number.isFinite(legPickupLng)) {
        points.push({ lat: legPickupLat, lng: legPickupLng });
      }
      if (Number.isFinite(legDropLat) && Number.isFinite(legDropLng)) {
        points.push({ lat: legDropLat, lng: legDropLng });
      }
    }
  }

  if (points.length === 0) {
    return (
      <div className="live-ops-map empty">
        <div className="live-ops-map-empty">
          <MapPin size={24} />
          <strong>No live coordinates returned</strong>
          <span>
            The backend has not returned valid driver/ride coordinates for the
            current operational window.
          </span>
        </div>
      </div>
    );
  }

  const minLat = Math.min(...points.map((point) => point.lat));
  const maxLat = Math.max(...points.map((point) => point.lat));
  const minLng = Math.min(...points.map((point) => point.lng));
  const maxLng = Math.max(...points.map((point) => point.lng));

  const latRange = Math.max(maxLat - minLat, 0.0005);
  const lngRange = Math.max(maxLng - minLng, 0.0005);

  const project = (lat: number, lng: number) => {
    const x = 40 + ((lng - minLng) / lngRange) * 920;
    const y = 360 - ((lat - minLat) / latRange) * 300;
    return { x, y };
  };

  const projectSafe = (lat: unknown, lng: unknown) => {
    const numericLat = Number(lat);
    const numericLng = Number(lng);
    if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) {
      return null;
    }
    return project(numericLat, numericLng);
  };

  return (
    <div className="live-ops-map">
      <div className="live-ops-map-head">
        <span className="map-badge">{formatNumber(onlineDrivers.length)} online GPS</span>
        <span className="map-badge">{formatNumber(activeBookings.length)} active rides</span>
      </div>
      <svg
        viewBox="0 0 1000 420"
        className="live-ops-map-svg"
        role="img"
        aria-label="Live RideX operational coordinate map"
      >
        <defs>
          <pattern
            id="ridex-live-grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          x="0"
          y="0"
          width="1000"
          height="420"
          rx="18"
          className="live-ops-map-surface"
        />
        <rect
          x="0"
          y="0"
          width="1000"
          height="420"
          rx="18"
          fill="url(#ridex-live-grid)"
        />

        {activeBookings.map((booking) => {
          const pickup =
            projectSafe(
              booking.pickupLatitude,
              booking.pickupLongitude,
            ) ??
            projectSafe(
              booking.legs?.[0]?.pickupLatitude,
              booking.legs?.[0]?.pickupLongitude,
            );
          const drop =
            projectSafe(
              booking.dropLatitude,
              booking.dropLongitude,
            ) ??
            projectSafe(
              booking.legs?.[booking.legs.length - 1]?.dropLatitude,
              booking.legs?.[booking.legs.length - 1]?.dropLongitude,
            );

          if (!pickup || !drop) return null;

          return (
            <g key={`ride-route-${booking.id}`}>
              <line
                x1={pickup.x}
                y1={pickup.y}
                x2={drop.x}
                y2={drop.y}
                className="live-ops-route-line"
              />
              <circle
                cx={pickup.x}
                cy={pickup.y}
                r="7"
                className="live-ops-point pickup"
              />
              <circle
                cx={drop.x}
                cy={drop.y}
                r="7"
                className="live-ops-point drop"
              />
            </g>
          );
        })}

        {onlineDrivers.map((driver) => {
          const projected = projectSafe(
            driver.location?.latitude,
            driver.location?.longitude,
          );
          if (!projected) return null;

          return (
            <g
              key={`driver-marker-${driver.id}`}
              className="live-ops-driver-marker"
              onClick={() => onDriverClick(driver.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  onDriverClick(driver.id);
                }
              }}
            >
              <circle
                cx={projected.x}
                cy={projected.y}
                r="15"
                className="live-ops-driver-ring"
              />
              <circle
                cx={projected.x}
                cy={projected.y}
                r="9"
                className="live-ops-driver-dot"
              />
              <text
                x={projected.x}
                y={projected.y + 4}
                textAnchor="middle"
                className="live-ops-driver-letter"
              >
                D
              </text>
              <title>
                {driver.fullName ?? driver.id} ·{" "}
                {driver.driverStatus ?? "UNKNOWN"}
              </title>
            </g>
          );
        })}
      </svg>
      <div className="live-ops-map-legend">
        <span><i className="legend-dot driver" /> Driver</span>
        <span><i className="legend-dot pickup" /> Pickup</span>
        <span><i className="legend-dot drop" /> Drop</span>
        <span className="map-legend-note">Coordinates supplied by backend</span>
      </div>
    </div>
  );
}

function App() {
  const [
    currentScreen,
    setCurrentScreen,
  ] = useState<Screen>(() => {
    try {
      const stored = sessionStorage.getItem(
        "ridex-current-screen",
      ) as Screen | null;
      return stored === "quickRide" ? "dashboard" : stored || "dashboard";
    } catch {
      return "dashboard";
    }
  });

  const [
    apiBaseUrl,
    setApiBaseUrl,
  ] = useState(DEFAULT_API_BASE);

  const [
    adminUserId,
    setAdminUserId,
  ] = useState(getStoredAdminId());

  const [
    connected,
    setConnected,
  ] = useState(Boolean(getStoredAdminToken()));
  const [sessionValidated, setSessionValidated] = useState(false);

  const [
    toast,
    setToast,
  ] = useState<ToastState | null>(null);

  const [adminMobile, setAdminMobile] = useState("");
  const [adminOtp, setAdminOtp] = useState("");
  const [testOtp, setTestOtp] = useState("");
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [integrationValues, setIntegrationValues] = useState<Record<string, string>>({});
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, { configured: boolean; updatedAt: string | null }>>({});
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [paymentRows, setPaymentRows] = useState<any[]>([]);
  const [promotionRows, setPromotionRows] = useState<any[]>([]);
  const [supportRows, setSupportRows] = useState<any[]>([]);
  const [notificationAudience, setNotificationAudience] = useState("ALL");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);


  const [
    selectedDriver,
    setSelectedDriver,
  ] = useState<Driver | null>(null);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<Customer | null>(null);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState<Booking | null>(null);

  const [
    confirmation,
    setConfirmation,
  ] = useState<{
    expectedText: string;
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  const [
    confirmationValue,
    setConfirmationValue,
  ] = useState("");

  const [
    confirmationLoading,
    setConfirmationLoading,
  ] = useState(false);

  const [
    globalLoading,
    setGlobalLoading,
  ] = useState(false);

  const [
    compactSidebar,
    setCompactSidebar,
  ] = useState(false);

  const [browserOnline, setBrowserOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>("offline");
  const [realtimeLastEvent, setRealtimeLastEvent] =
    useState<RealtimeEventEnvelope | null>(null);
  const realtimeAbortRef = useRef<AbortController | null>(null);
  const realtimeLastEventIdRef = useRef<string>(
    (() => {
      try {
        return sessionStorage.getItem("ridex-admin-last-event-id") ?? "";
      } catch {
        return "";
      }
    })(),
  );

  const [
    mobileNavOpen,
    setMobileNavOpen,
  ] = useState(false);

  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardData | null>(null);

  // Optional providers are intentionally non-blocking.
  void RIDEX_OPTIONAL_CONFIG;

  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(false);

  const [
    dashboardError,
    setDashboardError,
  ] = useState("");

  const [
    drivers,
    setDrivers,
  ] = useState<Driver[]>([]);

  const [
    driversLoading,
    setDriversLoading,
  ] = useState(false);

  const [
    driversError,
    setDriversError,
  ] = useState("");

  const [
    driverVerificationFilter,
    setDriverVerificationFilter,
  ] = useState("");

  const [
    driverStatusFilter,
    setDriverStatusFilter,
  ] = useState("");

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    bookingsLoading,
    setBookingsLoading,
  ] = useState(false);

  const [
    bookingsError,
    setBookingsError,
  ] = useState("");

  const [
    bookingStatusFilter,
    setBookingStatusFilter,
  ] = useState("");

  const [
    customers,
    setCustomers,
  ] = useState<Customer[]>([]);

  const [
    customersLoading,
    setCustomersLoading,
  ] = useState(false);

  const [
    customersError,
    setCustomersError,
  ] = useState("");

  const [
    sosEvents,
    setSosEvents,
  ] = useState<SosEvent[]>([]);

  const [
    safetyLoading,
    setSafetyLoading,
  ] = useState(false);

  const [
    safetyError,
    setSafetyError,
  ] = useState("");

  const [
    adminUsers,
    setAdminUsers,
  ] = useState<AdminUser[]>([]);

  const [
    adminsLoading,
    setAdminsLoading,
  ] = useState(false);

  const [
    adminsError,
    setAdminsError,
  ] = useState("");

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

  const [
    permissions,
    setPermissions,
  ] = useState<Permission[]>([]);

  const [
    rolesLoading,
    setRolesLoading,
  ] = useState(false);

  const [
    rolesError,
    setRolesError,
  ] = useState("");

  const [
    auditLogs,
    setAuditLogs,
  ] = useState<AuditLog[]>([]);

  const [
    auditLoading,
    setAuditLoading,
  ] = useState(false);

  const [
    auditError,
    setAuditError,
  ] = useState("");

  const [
    auditModuleFilter,
    setAuditModuleFilter,
  ] = useState("");

  const [
    auditEntityFilter,
    setAuditEntityFilter,
  ] = useState("");

  const [
    auditEntityIdFilter,
    setAuditEntityIdFilter,
  ] = useState("");

  const [
    quickLocations,
    setQuickLocations,
  ] = useState<QuickLocation[]>([]);

  const [
    quickLocationsLoading,
    setQuickLocationsLoading,
  ] = useState(false);

  const [
    quickLocationsError,
    setQuickLocationsError,
  ] = useState("");

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useState("");

  const [
    selectedPermissionIds,
    setSelectedPermissionIds,
  ] = useState<string[]>([]);

  const [
    newAdminForm,
    setNewAdminForm,
  ] = useState({
    name: "",
    mobile: "",
    email: "",
    workingLocation: "",
    department: "",
    operatingRegion: "",
    workAddress: "",
    requestedRole: "OPERATIONS",
    accessReason: "",
    role: "OPERATIONS",
  });

  const [
    createAdminLoading,
    setCreateAdminLoading,
  ] = useState(false);

  const [newAdminResume, setNewAdminResume] = useState<File | null>(null);

  const [
    setupLoading,
    setSetupLoading,
  ] = useState(false);

  const [
    testDataSummary,
    setTestDataSummary,
  ] = useState<TestDataSummary | null>(null);

  const [
    testDataRecords,
    setTestDataRecords,
  ] = useState<TestDataRecords | null>(null);

  const [testDataLoading, setTestDataLoading] = useState(false);
  const [platformState, setPlatformState] = useState<any | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [testerMobile, setTesterMobile] = useState("");
  const [testerLabel, setTesterLabel] = useState("");
  const [releaseVersion, setReleaseVersion] = useState("5.6.0");
  const [releaseLabel, setReleaseLabel] = useState("RideX 5.5 release");
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [pricingDraft, setPricingDraft] = useState({name:"",serviceType:"PASSENGER",bookingType:"RIDE",rideType:"FULL_RIDE",vehicleType:"E_RICKSHAW",baseFare:"0",perKm:"0",perMinute:"0",minFare:"0",maxFare:"0",multiplier:"1",priority:"0"});

  const [sharedRoutes, setSharedRoutes] = useState<SharedRoute[]>([]);
  const [sharedRoutesLoading, setSharedRoutesLoading] = useState(false);
  const [sharedRoutesError, setSharedRoutesError] = useState("");
  const [selectedSharedRoute, setSelectedSharedRoute] =
    useState<SharedRoute | null>(null);
  const [sharedRouteSaving, setSharedRouteSaving] = useState(false);
  const [sharedRouteDraft, setSharedRouteDraft] = useState({
    name: "",
    city: "",
    cityZoneId: "",
    selectionMode: "AUTO_NEAREST",
    active: false,
  });

  const [kycDocumentFilter, setKycDocumentFilter] = useState("");

  const [selectedSupportCase, setSelectedSupportCase] = useState<any | null>(null);
  const [supportCaseLoading, setSupportCaseLoading] = useState(false);
  const [supportReply, setSupportReply] = useState("");
  const [supportAttachmentUrl, setSupportAttachmentUrl] = useState("");
  const [supportReplyLoading, setSupportReplyLoading] = useState(false);

  const [
    serverMessage,
    setServerMessage,
  ] = useState("");

  const effectiveApiBase = useMemo(
    () =>
      apiBaseUrl
        .trim()
        .replace(/\/+$/, ""),
    [apiBaseUrl]
  );

  const showToast = useCallback(
    (
      type: ToastType,
      message: string
    ) => {
      setToast({
        type,
        message,
      });

      window.setTimeout(() => {
        setToast(null);
      }, 4500);
    },
    []
  );

  const apiRequest = useCallback(
    async <T,>(
      path: string,
      options?: RequestInit,
    ) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      const token = getStoredAdminToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      const method = String(options?.method ?? "GET").toUpperCase();
      const retryable = method === "GET" || method === "HEAD";
      const maxAttempts = retryable ? 2 : 1;

      let lastError: unknown = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          setBrowserOnline(false);
          throw new Error("Network is offline. Check the Admin connection and try again.");
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(
          () => controller.abort(),
          15_000,
        );

        try {
          const response = await fetch(
            `${effectiveApiBase}${path}`,
            {
              cache: "no-store",
              ...options,
              signal: controller.signal,
              headers: {
                ...headers,
                ...(options?.headers ?? {}),
              },
            },
          );

          if (response.status === 401) {
            saveStoredAdminToken("");
            saveStoredAdminId("");
            setAdminUserId("");
            setConnected(false);
            showToast(
              "error",
              "Admin session expired or is invalid. Please sign in again.",
            );
            throw new Error("Admin session expired or is invalid.");
          }

          setBrowserOnline(true);
          return await readResponse<T>(response);
        } catch (error) {
          lastError = error;

          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            throw new Error(
              `Request timed out after 15 seconds: ${path}`,
            );
          }

          if (
            typeof navigator !== "undefined" &&
            !navigator.onLine
          ) {
            setBrowserOnline(false);
            throw new Error(
              "Network connection was lost. Changes were not submitted.",
            );
          }

          if (attempt < maxAttempts) {
            await new Promise((resolve) =>
              window.setTimeout(resolve, 400 * attempt),
            );
            continue;
          }
        } finally {
          window.clearTimeout(timeout);
        }
      }

      throw (
        lastError instanceof Error
          ? lastError
          : new Error(`Request failed: ${path}`)
      );
    },
    [effectiveApiBase, showToast],
  );

  const loadPlatformState = useCallback(async () => {
    setPlatformLoading(true);
    try {
      const response = await apiRequest<any>("/admin/platform/state");
      setPlatformState(response);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to load platform state");
    } finally { setPlatformLoading(false); }
  }, [apiRequest, showToast]);

  const approveTester = useCallback(async () => {
    if (!/^\d{10}$/.test(testerMobile.replace(/\D/g, ""))) { showToast("error", "Enter a valid 10-digit mobile"); return; }
    try {
      await apiRequest("/admin/platform/testers", { method: "POST", body: JSON.stringify({ mobile: testerMobile, label: testerLabel }) });
      setTesterMobile(""); setTesterLabel(""); await loadPlatformState(); showToast("success", "TEST mobile approved");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to approve tester"); }
  }, [apiRequest, testerMobile, testerLabel, loadPlatformState, showToast]);

  const createRelease = useCallback(async () => {
    try {
      await apiRequest("/admin/platform/releases", { method: "POST", body: JSON.stringify({ version: releaseVersion, sourceLabel: releaseLabel }) });
      await loadPlatformState(); showToast("success", "Release created in TEST");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to create release"); }
  }, [apiRequest, releaseVersion, releaseLabel, loadPlatformState, showToast]);

  const promoteRelease = useCallback(async (id: string) => {
    if (!window.confirm("Promote this APPROVED release to LIVE?")) return;
    try {
      await apiRequest(`/admin/platform/releases/${id}/promote`, { method: "POST", body: JSON.stringify({ confirmation: "PROMOTE TO LIVE" }) });
      await loadPlatformState(); showToast("success", "Approved release promoted to LIVE");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to promote release"); }
  }, [apiRequest, loadPlatformState, showToast]);

  const testStartRelease = useCallback(async (id: string) => {
    try {
      await apiRequest(`/admin/platform/releases/${id}/test-start`, { method: "POST" });
      await loadPlatformState();
      showToast("success", "TEST run started");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to start TEST run"); }
  }, [apiRequest, loadPlatformState, showToast]);

  const testCompleteRelease = useCallback(async (id: string) => {
    const failed = Number(window.prompt("Failed tests", "0") ?? "0");
    const errors = Number(window.prompt("Test errors", "0") ?? "0");
    const passed = Number(window.prompt("Passed tests", "1") ?? "1");
    if (![failed, errors, passed].every(Number.isFinite) || failed < 0 || errors < 0 || passed < 0) {
      showToast("error", "Invalid test result counts");
      return;
    }
    try {
      await apiRequest(`/admin/platform/releases/${id}/test-complete`, {
        method: "POST",
        body: JSON.stringify({ failed, errors, passed, name: "Admin Control Center Verification" }),
      });
      await loadPlatformState();
      showToast("success", failed || errors ? "TEST marked FAILED" : "TEST marked PASSED");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to complete TEST run"); }
  }, [apiRequest, loadPlatformState, showToast]);

  const approveRelease = useCallback(async (id: string) => {
    try {
      await apiRequest(`/admin/platform/releases/${id}/approve`, { method: "POST" });
      await loadPlatformState();
      showToast("success", "Release approved for LIVE promotion");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to approve release"); }
  }, [apiRequest, loadPlatformState, showToast]);

  const renderPlatform = () => {
    const control = platformState?.control;
    const releases = Array.isArray(platformState?.releases) ? platformState.releases : [];
    const testers = Array.isArray(platformState?.testers) ? platformState.testers : [];
    return (
      <div>
        <div className="panel-header"><div><p className="eyebrow">PLATFORM CONTROL</p><h2>Test / Live Control</h2><p>Super Admin only: verify in TEST, then deliberately promote an approved version to LIVE.</p></div></div>
        <div className="content-grid two">
          <Panel title="Environment" subtitle="TEST data never becomes production data">
            <div className="metric-card"><strong>{control?.activeEnvironment || "TEST"}</strong><span>Active control state</span></div>
            <div className="info-box" style={{marginTop:12}}><strong>Runtime</strong><p>{platformState?.runtimeEnvironment || "Unknown"} · Current version {control?.currentVersion || "5.6.0"}</p></div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="button secondary" onClick={() => apiRequest("/admin/platform/environment", {method:"PUT",body:JSON.stringify({environment:"TEST"})}).then(loadPlatformState)}>TEST</button>
              <span className="status warning">LIVE only through an APPROVED release below</span>
            </div>
          </Panel>
          <Panel title="Approved Testers" subtitle="Super Admin approved mobile numbers">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8}}>
              <input className="text-input" value={testerMobile} onChange={e=>setTesterMobile(e.target.value)} placeholder="10-digit mobile" />
              <input className="text-input" value={testerLabel} onChange={e=>setTesterLabel(e.target.value)} placeholder="Tester label" />
              <button className="button primary" onClick={()=>void approveTester()}>Approve</button>
            </div>
            <div style={{marginTop:12}}>{testers.map((t:any)=><div key={t.id} className="table-row"><span>{t.mobile}</span><span>{t.label || "TESTER"}</span><span>{t.active ? "ACTIVE" : "REVOKED"}</span></div>)}</div>
          </Panel>
        </div>
        <Panel title="Project Releases" subtitle="TEST → prove → approve → LIVE">
          <div style={{display:"grid",gridTemplateColumns:"160px 1fr auto",gap:8,marginBottom:12}}>
            <input className="text-input" value={releaseVersion} onChange={e=>setReleaseVersion(e.target.value)} placeholder="5.6.0" />
            <input className="text-input" value={releaseLabel} onChange={e=>setReleaseLabel(e.target.value)} placeholder="Source/version label" />
            <button className="button primary" onClick={()=>void createRelease()}>Create TEST Release</button>
          </div>
          {releases.map((r:any)=><div key={r.id} className="table-row">
            <span><strong>{r.version}</strong> · {r.environment}</span>
            <span>{r.status}</span>
            <span style={{display:"flex",gap:6,justifyContent:"flex-end",flexWrap:"wrap"}}>
              {r.status === "UPLOADED" ? <button className="button secondary small" onClick={()=>void testStartRelease(r.id)}>Start TEST</button> : null}
              {r.status === "TESTING" ? <button className="button secondary small" onClick={()=>void testCompleteRelease(r.id)}>Complete TEST</button> : null}
              {r.status === "PASSED" ? <button className="button primary small" onClick={()=>void approveRelease(r.id)}>Approve</button> : null}
              {r.status === "APPROVED" ? <button className="button primary small" onClick={()=>void promoteRelease(r.id)}>LIVE</button> : null}
            </span>
          </div>)}
        </Panel>
        <div className="info-box"><strong>Deployment safety</strong><p>Only APPROVED releases can be promoted. All environment/deployment/tester actions are audited by the backend.</p></div>
      </div>
    );
  };

  const loadIntegrationStatus = useCallback(async () => {
    setIntegrationLoading(true);
    try {
      const response = await apiRequest<Array<{ key: string; configured: boolean; updatedAt: string | null }>>("/admin/configuration/status");
      const next: Record<string, { configured: boolean; updatedAt: string | null }> = {};
      (response.data ?? []).forEach((item) => { next[item.key] = { configured: Boolean(item.configured), updatedAt: item.updatedAt ?? null }; });
      setIntegrationStatus(next);
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to load integration status"); }
    finally { setIntegrationLoading(false); }
  }, [apiRequest]);

  const saveIntegrationValue = useCallback(async (key: string) => {
    const value = String(integrationValues[key] ?? "").trim();
    if (!value) { showToast("error", `${key} value is required`); return; }
    try {
      await apiRequest(`/admin/configuration/${encodeURIComponent(key)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) });
      setIntegrationValues((current) => ({ ...current, [key]: "" }));
      showToast("success", `${key} updated securely`);
      void loadIntegrationStatus();
    } catch (error) { showToast("error", error instanceof Error ? error.message : `Unable to update ${key}`); }
  }, [apiRequest, integrationValues, loadIntegrationStatus]);

  const loadOperationsData = useCallback(async () => {
    setOperationLoading(true);
    try {
      const [payments, promotions, support] = await Promise.all([
        apiRequest<any[]>("/admin/payments"),
        apiRequest<any[]>("/admin/promotions"),
        apiRequest<any[]>("/support/admin/cases"),
      ]);
      setPaymentRows(Array.isArray(payments.data) ? payments.data : []);
      setPromotionRows(Array.isArray(promotions.data) ? promotions.data : []);
      setSupportRows(Array.isArray(support.data) ? support.data : []);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to load operations data");
    } finally {
      setOperationLoading(false);
    }
  }, [apiRequest, showToast]);

  const createPromotion = useCallback(async () => {
    const code = window.prompt("Promotion code (e.g. WELCOME50)");
    if (!code) return;
    const value = Number(window.prompt("Discount value"));
    if (!Number.isFinite(value) || value <= 0) return showToast("error", "Enter a valid discount value");
    const from = new Date();
    const until = new Date(from.getTime() + 30 * 86400000);
    try {
      await apiRequest("/admin/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, discountType: "FIXED", discountValue: value, validFrom: from.toISOString(), validUntil: until.toISOString(), rideScope: "ALL" }) });
      showToast("success", "Promotion created");
      await loadOperationsData();
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to create promotion"); }
  }, [apiRequest, loadOperationsData, showToast]);

  const sendBroadcast = useCallback(async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) return showToast("error", "Title and message are required");
    try {
      await apiRequest("/admin/notifications/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audience: notificationAudience, title: notificationTitle.trim(), body: notificationBody.trim() }) });
      showToast("success", "Notification broadcast sent");
      setNotificationTitle(""); setNotificationBody("");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Unable to send notification"); }
  }, [apiRequest, notificationAudience, notificationTitle, notificationBody, showToast]);

  const loadTestData = useCallback(async () => {
    if (!RIDEX_TEST_MODE) return;
    setTestDataLoading(true);
    try {
      const [summary, records] = await Promise.all([
        apiRequest<TestDataSummary>("/admin/test-data/summary"),
        apiRequest<TestDataRecords>("/admin/test-data/records"),
      ]);
      setTestDataSummary(summary.data ?? null);
      setTestDataRecords(records.data ?? null);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to load test data");
    } finally {
      setTestDataLoading(false);
    }
  }, [apiRequest, showToast]);

  const seedAllTestData = useCallback(async () => {
    const confirmationText = window.prompt('Type: SEED RIDEX V3.5 TEST DATA');
    if (confirmationText !== "SEED RIDEX V3.5 TEST DATA") return;
    setTestDataLoading(true);
    try {
      await apiRequest("/admin/test-data/seed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: "SEED RIDEX V3.5 TEST DATA" }) });
      showToast("success", "RideX v3.5 comprehensive test data seeded");
      await loadTestData();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to seed test data");
    } finally {
      setTestDataLoading(false);
    }
  }, [apiRequest, loadTestData, showToast]);

  const deleteAllTestData = useCallback(async () => {
    const confirmationText = window.prompt('Type: DELETE RIDEX V3.5 TEST DATA');
    if (confirmationText !== "DELETE RIDEX V3.5 TEST DATA") return;
    setTestDataLoading(true);
    try {
      await apiRequest("/admin/test-data", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: "DELETE RIDEX V3.5 TEST DATA" }) });
      showToast("success", "RideX v3.5 test data deleted");
      await loadTestData();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Unable to delete test data");
    } finally {
      setTestDataLoading(false);
    }
  }, [apiRequest, loadTestData, showToast]);

  const loadDashboard =
    useCallback(async () => {
      setDashboardLoading(true);
      setDashboardError("");

      try {
        const response =
          await apiRequest<DashboardData>(
            "/admin/dashboard"
          );

        setDashboard(
          response.data ?? null
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setDashboardError(message);
      } finally {
        setDashboardLoading(false);
      }
    }, [apiRequest]);

  const loadDrivers = useCallback(
    async (background = false) => {
      if (!background) setDriversLoading(true);
      setDriversError("");

      try {
        const query = new URLSearchParams();

        if (
          driverVerificationFilter
            .trim()
        ) {
          query.set(
            "verificationStatus",
            driverVerificationFilter
          );
        }

        if (driverStatusFilter.trim()) {
          query.set(
            "driverStatus",
            driverStatusFilter
          );
        }

        const suffix = query.toString()
          ? `?${query.toString()}`
          : "";

        const response =
          await apiRequest<Driver[]>(
            `/admin/drivers${suffix}`
          );

        setDrivers(
          safeArray<Driver>(
            response.data
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setDriversError(message);
      } finally {
        if (!background) setDriversLoading(false);
      }
    },
    [
      apiRequest,
      driverVerificationFilter,
      driverStatusFilter,
    ]
  );

  const loadBookings =
    useCallback(async () => {
      setBookingsLoading(true);
      setBookingsError("");

      try {
        const query = new URLSearchParams();

        if (bookingStatusFilter.trim()) {
          query.set(
            "status",
            bookingStatusFilter
          );
        }

        const suffix = query.toString()
          ? `?${query.toString()}`
          : "";

        const response =
          await apiRequest<Booking[]>(
            `/admin/bookings${suffix}`
          );

        setBookings(
          safeArray<Booking>(
            response.data
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setBookingsError(message);
      } finally {
        setBookingsLoading(false);
      }
    }, [
      apiRequest,
      bookingStatusFilter,
    ]);

  const loadCustomers =
    useCallback(async () => {
      setCustomersLoading(true);
      setCustomersError("");

      try {
        const response =
          await apiRequest<Customer[]>(
            "/admin/customers"
          );

        setCustomers(
          safeArray<Customer>(
            response.data
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setCustomersError(message);
      } finally {
        setCustomersLoading(false);
      }
    }, [apiRequest]);

  const loadSafety = useCallback(
    async () => {
      setSafetyLoading(true);
      setSafetyError("");

      try {
        const response =
          await apiRequest<SosEvent[]>(
            "/admin/safety/sos"
          );

        setSosEvents(
          safeArray<SosEvent>(
            response.data
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setSafetyError(message);
      } finally {
        setSafetyLoading(false);
      }
    },
    [apiRequest]
  );

  const loadAdmins = useCallback(
    async () => {
      setAdminsLoading(true);
      setAdminsError("");

      try {
        const response =
          await apiRequest<AdminUser[]>(
            "/admin/admins"
          );

        setAdminUsers(
          safeArray<AdminUser>(
            response.data
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setAdminsError(message);
      } finally {
        setAdminsLoading(false);
      }
    },
    [apiRequest]
  );

  const loadRoles =
    useCallback(async () => {
      setRolesLoading(true);
      setRolesError("");

      try {
        const [rolesResponse, permissionsResponse] =
          await Promise.all([
            apiRequest<Role[]>(
              "/admin/roles"
            ),
            apiRequest<Permission[]>(
              "/admin/permissions"
            ),
          ]);

        const nextRoles =
          safeArray<Role>(
            rolesResponse.data
          );

        const nextPermissions =
          safeArray<Permission>(
            permissionsResponse.data
          );

        setRoles(nextRoles);
        setPermissions(
          nextPermissions
        );

        if (
          nextRoles.length > 0 &&
          !nextRoles.some(
            (role) =>
              role.id ===
              selectedRoleId
          )
        ) {
          setSelectedRoleId(
            nextRoles[0].id
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setRolesError(message);
      } finally {
        setRolesLoading(false);
      }
    }, [
      apiRequest,
      selectedRoleId,
    ]);

  const loadAuditLogs =
    useCallback(async () => {
      setAuditLoading(true);
      setAuditError("");

      try {
        const query = new URLSearchParams();

        if (auditModuleFilter.trim()) {
          query.set(
            "module",
            auditModuleFilter.trim()
          );
        }

        if (auditEntityFilter.trim()) {
          query.set(
            "entityType",
            auditEntityFilter.trim()
          );
        }

        if (
          auditEntityIdFilter.trim()
        ) {
          query.set(
            "entityId",
            auditEntityIdFilter.trim()
          );
        }

        const suffix = query.toString()
          ? `?${query.toString()}`
          : "";

        const response =
          await apiRequest<AuditLog[]>(
            `/admin/audit-logs${suffix}`
          );

        setAuditLogs(
          safeArray<AuditLog>(
            response.data
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setAuditError(message);
      } finally {
        setAuditLoading(false);
      }
    }, [
      apiRequest,
      auditModuleFilter,
      auditEntityFilter,
      auditEntityIdFilter,
    ]);

  const loadQuickLocations =
    useCallback(async () => {
      setQuickLocationsLoading(true);
      setQuickLocationsError("");

      try {
        const response =
          await apiRequest<
            QuickLocation[]
          >(
            "/admin/quick-locations"
          );

        setQuickLocations(
          safeArray<QuickLocation>(
            response.data
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setQuickLocationsError(message);
      } finally {
        setQuickLocationsLoading(
          false
        );
      }
    }, [apiRequest]);

  const loadSharedRoutes = useCallback(async () => {
    setSharedRoutesLoading(true);
    setSharedRoutesError("");
    try {
      const response = await apiRequest<SharedRoute[]>(
        "/admin/shared-routes/routes",
      );
      const payload = response.data;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(response.routes)
          ? (response.routes as SharedRoute[])
          : [];
      setSharedRoutes(rows);
      if (
        selectedSharedRoute &&
        rows.some((route) => route.id === selectedSharedRoute.id)
      ) {
        const refreshed =
          rows.find((route) => route.id === selectedSharedRoute.id) ??
          null;
        setSelectedSharedRoute(refreshed);
        if (refreshed) {
          setSharedRouteDraft({
            name: String(refreshed.name ?? ""),
            city: String(refreshed.city ?? ""),
            cityZoneId: String(refreshed.cityZoneId ?? ""),
            selectionMode: String(
              refreshed.selectionMode ?? "AUTO_NEAREST",
            ),
            active: Boolean(refreshed.active),
          });
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      setSharedRoutesError(message);
    } finally {
      setSharedRoutesLoading(false);
    }
  }, [apiRequest, selectedSharedRoute]);

  const saveSharedRoute = useCallback(async () => {
    if (!selectedSharedRoute) return;

    const name = sharedRouteDraft.name.trim();
    if (!name) {
      showToast("error", "Shared Ride route name is required.");
      return;
    }

    setSharedRouteSaving(true);
    try {
      await apiRequest(
        `/admin/shared-routes/routes/${encodeURIComponent(
          selectedSharedRoute.id,
        )}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name,
            city: sharedRouteDraft.city.trim() || null,
            cityZoneId: sharedRouteDraft.cityZoneId.trim() || null,
            selectionMode: sharedRouteDraft.selectionMode,
            active: Boolean(sharedRouteDraft.active),
          }),
        },
      );
      showToast("success", "Shared Ride route updated.");
      await loadSharedRoutes();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSharedRouteSaving(false);
    }
  }, [
    apiRequest,
    loadSharedRoutes,
    selectedSharedRoute,
    sharedRouteDraft,
    showToast,
  ]);

  const openSharedRoute = useCallback((route: SharedRoute) => {
    setSelectedSharedRoute(route);
    setSharedRouteDraft({
      name: String(route.name ?? ""),
      city: String(route.city ?? ""),
      cityZoneId: String(route.cityZoneId ?? ""),
      selectionMode: String(route.selectionMode ?? "AUTO_NEAREST"),
      active: Boolean(route.active),
    });
  }, []);

  const loadDriverDetails =
    useCallback(
      async (
        driverId: string
      ) => {
        try {
          const response =
            await apiRequest<Driver>(
              `/admin/drivers/${encodeURIComponent(
                driverId
              )}`
            );

          setSelectedDriver(
            response.data ?? null
          );
        } catch (error) {
          showToast(
            "error",
            error instanceof Error
              ? error.message
              : String(error)
          );
        }
      },
      [apiRequest, showToast]
    );

  const loadBookingDetails =
    useCallback(
      async (
        bookingId: string
      ) => {
        try {
          const response =
            await apiRequest<Booking>(
              `/admin/bookings/${encodeURIComponent(
                bookingId
              )}`
            );

          setSelectedBooking(
            response.data ?? null
          );
        } catch (error) {
          showToast(
            "error",
            error instanceof Error
              ? error.message
              : String(error)
          );
        }
      },
      [apiRequest, showToast]
    );

  const loadCustomerDetails =
    useCallback(
      async (
        customerId: string
      ) => {
        try {
          const response =
            await apiRequest<Customer>(
              `/admin/customers/${encodeURIComponent(
                customerId
              )}`
            );

          setSelectedCustomer(
            response.data ?? null
          );
        } catch (error) {
          showToast(
            "error",
            error instanceof Error
              ? error.message
              : String(error)
          );
        }
      },
      [apiRequest, showToast]
    );

  const openSupportCase = useCallback(
    async (caseId: string) => {
      setSupportCaseLoading(true);
      try {
        const response = await apiRequest<any>(
          `/support/admin/cases/${encodeURIComponent(caseId)}`,
        );
        setSelectedSupportCase(response.data ?? null);
        setSupportReply("");
        setSupportAttachmentUrl("");
      } catch (error) {
        showToast(
          "error",
          error instanceof Error ? error.message : String(error),
        );
      } finally {
        setSupportCaseLoading(false);
      }
    },
    [apiRequest, showToast],
  );

  const sendSupportReply = useCallback(async () => {
    const caseId = String(selectedSupportCase?.id ?? "").trim();
    const message = supportReply.trim();

    if (!caseId) {
      showToast("error", "Select a support case first.");
      return;
    }
    if (!message) {
      showToast("error", "Reply message is required.");
      return;
    }

    setSupportReplyLoading(true);
    try {
      await apiRequest(
        `/support/admin/cases/${encodeURIComponent(caseId)}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            message,
            ...(supportAttachmentUrl.trim()
              ? { attachmentUrl: supportAttachmentUrl.trim() }
              : {}),
          }),
        },
      );

      showToast("success", "Support reply sent.");
      setSupportReply("");
      setSupportAttachmentUrl("");
      await openSupportCase(caseId);
      await loadOperationsData();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSupportReplyLoading(false);
    }
  }, [
    apiRequest,
    loadOperationsData,
    openSupportCase,
    selectedSupportCase,
    showToast,
    supportAttachmentUrl,
    supportReply,
  ]);

  const runInitialLoad =
    useCallback(async () => {
      setGlobalLoading(true);

      try {
        // Avoid an AuthSession/DB connection burst during startup.
        await loadDashboard();
        await Promise.all([loadDrivers(), loadBookings(), loadCustomers()]);
        await Promise.all([loadSafety(), loadAdmins(), loadRoles()]);
        await Promise.all([loadAuditLogs(), loadQuickLocations()]);
      } finally {
        setGlobalLoading(false);
      }
    }, [
      loadDashboard,
      loadDrivers,
      loadBookings,
      loadCustomers,
      loadSafety,
      loadAdmins,
      loadRoles,
      loadAuditLogs,
      loadQuickLocations,
    ]);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAdminToken();

    if (!token) {
      setSessionValidated(true);
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`${effectiveApiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("SESSION_INVALID");
        const data = await response.json().catch(() => ({}));
        if (!data?.success || String(data?.data?.userType || "").toUpperCase() !== "ADMIN") throw new Error("SESSION_INVALID");
        if (!cancelled) setConnected(true);
      } catch {
        if (!cancelled) {
          saveStoredAdminToken("");
          saveStoredAdminId("");
          setConnected(false);
        }
      } finally {
        if (!cancelled) setSessionValidated(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!connected || !sessionValidated) return;
    void runInitialLoad();
  }, [connected, sessionValidated, runInitialLoad]);

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refreshForRealtimeEvent = useCallback(
    (eventType: string) => {
      const normalized = String(eventType ?? "")
        .trim()
        .toUpperCase();

      if (
        normalized === "DRIVER_ONLINE" ||
        normalized === "DRIVER_OFFLINE" ||
        normalized === "GPS_UPDATED"
      ) {
        void loadDrivers(true);
        return;
      }

      if (
        normalized.includes("REQUEST_") ||
        normalized.includes("DRIVER_ARRIVING") ||
        normalized.includes("DRIVER_ARRIVED") ||
        normalized.includes("TRIP_") ||
        normalized === "OTP_VERIFIED" ||
        normalized === "ROUTE_CHANGED"
      ) {
        void loadBookings();
        void loadDrivers(true);
        return;
      }

      if (
        normalized === "SOS_TRIGGERED" ||
        normalized.startsWith("SAFETY_") ||
        normalized.startsWith("INCIDENT_")
      ) {
        void loadSafety();
        void loadDashboard();
        return;
      }

      if (
        normalized === "PAYMENT_COMPLETED" ||
        normalized.startsWith("PAYMENT_")
      ) {
        void loadOperationsData();
        void loadDashboard();
      }
    },
    [
      loadBookings,
      loadDashboard,
      loadDrivers,
      loadOperationsData,
      loadSafety,
    ],
  );

  const connectAdminRealtime = useCallback(() => {
    if (!connected || !adminUserId) {
      setRealtimeStatus("offline");
      return () => undefined;
    }

    let stopped = false;
    let retryDelayMs = 1_000;

    const resolvedActorId =
      adminUsers.find(
        (admin) =>
          String(admin.id ?? "") === String(adminUserId) ||
          String(admin.userId ?? "") === String(adminUserId),
      )?.id ?? adminUserId;

    const parseSseBlock = (block: string) => {
      let eventId = "";
      let eventType = "message";
      const dataLines: string[] = [];

      for (const rawLine of block.split("\n")) {
        const line = rawLine.replace(/\r$/, "");
        if (!line || line.startsWith(":")) continue;

        if (line.startsWith("id:")) {
          eventId = line.slice(3).trim();
          continue;
        }

        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim() || "message";
          continue;
        }

        if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).replace(/^ /, ""));
        }
      }

      if (dataLines.length === 0) return null;

      let parsedData: unknown = dataLines.join("\n");
      try {
        parsedData = JSON.parse(dataLines.join("\n"));
      } catch {
        // Keep non-JSON payload as plain text.
      }

      return {
        id: eventId,
        type: eventType,
        data: parsedData,
      };
    };

    const wait = (delay: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, delay);
      });

    const run = async () => {
      while (!stopped) {
        if (
          typeof navigator !== "undefined" &&
          !navigator.onLine
        ) {
          setBrowserOnline(false);
          setRealtimeStatus("offline");
          await wait(Math.min(retryDelayMs, 15_000));
          continue;
        }

        setRealtimeStatus(
          retryDelayMs === 1_000 ? "connecting" : "reconnecting",
        );

        const controller = new AbortController();
        realtimeAbortRef.current = controller;

        try {
          const lastEventId = realtimeLastEventIdRef.current;
          const headers: Record<string, string> = {
            Accept: "text/event-stream",
            Authorization: `Bearer ${getStoredAdminToken()}`,
            "Cache-Control": "no-cache",
          };

          if (lastEventId) {
            headers["Last-Event-ID"] = lastEventId;
          }

          const response = await fetch(
            `${effectiveApiBase}/realtime/stream?actorType=ADMIN&actorId=${encodeURIComponent(
              resolvedActorId,
            )}`,
            {
              method: "GET",
              headers,
              cache: "no-store",
              signal: controller.signal,
            },
          );

          if (response.status === 401 || response.status === 403) {
            saveStoredAdminToken("");
            saveStoredAdminId("");
            setAdminUserId("");
            setConnected(false);
            setRealtimeStatus("offline");
            showToast(
              "error",
              "Realtime authorization expired. Please sign in again.",
            );
            break;
          }

          if (!response.ok || !response.body) {
            throw new Error(
              `Realtime stream failed (${response.status})`,
            );
          }

          setBrowserOnline(true);
          setRealtimeStatus("connected");
          retryDelayMs = 1_000;

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!stopped) {
            const { value, done } = await reader.read();
            if (done) {
              throw new Error("Realtime stream closed.");
            }

            buffer += decoder.decode(value, { stream: true });
            buffer = buffer.replace(/\r\n/g, "\n");

            let separatorIndex = buffer.indexOf("\n\n");
            while (separatorIndex >= 0) {
              const block = buffer.slice(0, separatorIndex);
              buffer = buffer.slice(separatorIndex + 2);

              const parsed = parseSseBlock(block);
              if (parsed) {
                if (parsed.id) {
                  realtimeLastEventIdRef.current = parsed.id;
                  try {
                    sessionStorage.setItem(
                      "ridex-admin-last-event-id",
                      parsed.id,
                    );
                  } catch {
                    // Ignore session-storage failures.
                  }
                }

                const envelope: RealtimeEventEnvelope = {
                  id:
                    parsed.id ||
                    `${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2, 8)}`,
                  type: parsed.type,
                  data: parsed.data,
                  receivedAt: new Date().toISOString(),
                };

                setRealtimeLastEvent(envelope);
                refreshForRealtimeEvent(parsed.type);
              }

              separatorIndex = buffer.indexOf("\n\n");
            }
          }
        } catch (error) {
          if (stopped || controller.signal.aborted) break;

          setRealtimeStatus("reconnecting");
          await wait(Math.min(retryDelayMs, 15_000));
          retryDelayMs = Math.min(retryDelayMs * 2, 15_000);
        }
      }

      if (!stopped) {
        setRealtimeStatus("offline");
      }
    };

    void run();

    return () => {
      stopped = true;
      realtimeAbortRef.current?.abort();
      realtimeAbortRef.current = null;
    };
  }, [
    adminUserId,
    adminUsers,
    connected,
    effectiveApiBase,
    refreshForRealtimeEvent,
    showToast,
  ]);

  useEffect(() => {
    if (!connected) return;

    const refreshLiveData = () => {
      void loadDashboard();
      if (
        currentScreen === "liveOperations" ||
        currentScreen === "bookings" ||
        currentScreen === "drivers" ||
        currentScreen === "safety" ||
        currentScreen === "matching"
      ) {
        void loadBookings();
        void loadDrivers(true);
        void loadSafety();
      }
    };

    const timer = window.setInterval(refreshLiveData, realtimeStatus === "connected" ? 30000 : 12000);
    return () => window.clearInterval(timer);
  }, [
    connected,
    currentScreen,
    loadDashboard,
    loadBookings,
    loadDrivers,
    loadSafety,
    realtimeStatus,
  ]);

  useEffect(() => {
    if (connected && currentScreen === "settings") void loadIntegrationStatus();
  }, [connected, currentScreen, loadIntegrationStatus]);

  useEffect(() => {
    if (connected && currentScreen === "routes") {
      void loadSharedRoutes();
    }
  }, [connected, currentScreen, loadSharedRoutes]);

  useEffect(() => {
    if (!connected) {
      setRealtimeStatus("offline");
      realtimeAbortRef.current?.abort();
      return;
    }

    const cleanup = connectAdminRealtime();
    return cleanup;
  }, [connected, connectAdminRealtime]);

  useEffect(() => {
    if (connected && currentScreen === "setup" && RIDEX_TEST_MODE) void loadTestData();
    if (connected && currentScreen === "platform") void loadPlatformState();
  }, [connected, currentScreen, loadTestData, loadPlatformState]);

  useEffect(() => {
    if (connected && ["payments", "promotions", "support"].includes(currentScreen)) void loadOperationsData();
  }, [connected, currentScreen, loadOperationsData]);

  useEffect(() => {
    const selectedRole =
      roles.find(
        (role) =>
          role.id === selectedRoleId
      );

    setSelectedPermissionIds(
      safeArray<{
        permission: Permission;
      }>(
        selectedRole?.permissionLinks
      )
        .map(
          (link) => link.permission?.id
        )
        .filter(Boolean) as string[]
    );
  }, [roles, selectedRoleId]);

  const navigate = (
    screen: Screen
  ) => {
    setCurrentScreen(screen);
    sessionStorage.setItem('ridex-current-screen', screen);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const sendAdminOtp = async () => {
    const mobile = adminMobile.replace(/\D/g, "").slice(-10);

    if (!/^\d{10}$/.test(mobile)) {
      showToast(
        "error",
        "Enter a valid 10-digit admin mobile number.",
      );
      return;
    }

    setAdminAuthLoading(true);
    setTestOtp("");

    try {
      const response = await fetch(
        `${effectiveApiBase}/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            userType: "ADMIN",
            purposeCode: ADMIN_LOGIN_PURPOSE,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to send admin OTP",
        );
      }

      const generatedTestOtp = String(
        data.testOtp ?? "",
      ).trim();

      /*
       * The backend is the source of truth. In TEST it returns testOtp.
       * Do not require VITE_RIDEX_TEST_MODE just to render the returned OTP,
       * because a deployed frontend can otherwise hide a valid TEST response.
       * The backend never returns testOtp in Production.
       */
      if (/^\d{4}$/.test(generatedTestOtp)) {
        setTestOtp(generatedTestOtp);
        setAdminOtp(generatedTestOtp);
      }

      showToast(
        "success",
        generatedTestOtp
          ? "Admin TEST OTP generated and filled into the OTP field."
          : "Admin OTP request accepted. Check the configured OTP delivery channel.",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to send admin OTP",
      );
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const verifyAdminOtp = async () => {
    const mobile = adminMobile.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(mobile) || adminOtp.length !== 4) { showToast("error", "Enter admin mobile and 4-digit OTP."); return; }
    setAdminAuthLoading(true);
    try {
      const response = await fetch(`${effectiveApiBase}/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mobile, otp: adminOtp, userType: "ADMIN", purposeCode: ADMIN_LOGIN_PURPOSE }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || "Invalid admin OTP");
      const token = String(data.data?.token || "").trim();
      const userId = String(data.data?.userId || "").trim();
      if (!token || !userId) throw new Error("Admin session was not returned by backend");
      saveStoredAdminToken(token);
      saveStoredAdminId(userId);
      setAdminUserId(userId);
      setConnected(true);
      setSessionValidated(true);
      setAdminOtp("");
      setTestOtp("");
      showToast("success", "Admin session established.");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Admin login failed"); }
    finally { setAdminAuthLoading(false); }
  };

  const handleDisconnect = async () => {
    const token = getStoredAdminToken();
    try {
      if (token) {
        await fetch(`${effectiveApiBase}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Client state is still cleared even if the network is unavailable.
    }

    realtimeAbortRef.current?.abort();
    realtimeAbortRef.current = null;
    try {
      sessionStorage.removeItem("ridex-admin-last-event-id");
    } catch {
      // Ignore storage failures.
    }
    setRealtimeStatus("offline");
    setRealtimeLastEvent(null);
    saveStoredAdminId("");
    saveStoredAdminToken("");
    setAdminUserId("");
    setConnected(false);
    setAdminOtp("");
    setTestOtp("");
    setDashboard(null);
    setSelectedDriver(null);
    setSelectedBooking(null);
    setSelectedCustomer(null);
    showToast(
      "info",
      "Admin session disconnected."
    );
  };

  const requestConfirmation = (
    title: string,
    description: string,
    expectedText: string,
    action: () => Promise<void>
  ) => {
    setConfirmation({
      title,
      description,
      expectedText,
      action,
    });
    setConfirmationValue("");
  };

  const executeConfirmation =
    async () => {
      if (!confirmation) return;

      if (
        confirmationValue
          .trim()
          .toUpperCase() !==
        confirmation.expectedText
          .toUpperCase()
      ) {
        showToast(
          "error",
          `Please type "${confirmation.expectedText}".`
        );
        return;
      }

      setConfirmationLoading(true);

      try {
        await confirmation.action();

        setConfirmation(null);
        setConfirmationValue("");
      } catch (error) {
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : String(error)
        );
      } finally {
        setConfirmationLoading(false);
      }
    };

  const updateDriverVerification =
    async (
      driver: Driver,
      verificationStatus: string
    ) => {
      try {
        const response =
          await apiRequest<Driver>(
            `/admin/drivers/${encodeURIComponent(
              driver.id
            )}/verification`,
            {
              method: "PATCH",
              body: JSON.stringify({
                verificationStatus,
              }),
            }
          );

        showToast(
          "success",
          response.message ??
            "Driver verification updated."
        );

        await loadDrivers();

        if (
          selectedDriver?.id ===
          driver.id
        ) {
          setSelectedDriver(
            response.data ?? null
          );
        }

        await loadDashboard();
      } catch (error) {
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    };

  const updateDriverStatus =
    async (
      driver: Driver,
      status: string
    ) => {
      const perform = async () => {
        const response =
          await apiRequest<Driver>(
            `/admin/drivers/${encodeURIComponent(
              driver.id
            )}/status`,
            {
              method: "PATCH",
              body: JSON.stringify({
                status,
                ...(status === "SUSPENDED"
                  ? {
                      confirmation:
                        "SUSPEND DRIVER",
                    }
                  : {}),
              }),
            }
          );

        showToast(
          "success",
          response.message ??
            "Driver status updated."
        );

        await loadDrivers();
        await loadDashboard();

        if (
          selectedDriver?.id ===
          driver.id
        ) {
          setSelectedDriver(
            response.data ?? null
          );
        }
      };

      if (status === "SUSPENDED") {
        requestConfirmation(
          "Suspend Driver",
          `This will suspend ${driver.fullName ?? driver.id}.`,
          "SUSPEND DRIVER",
          perform
        );
        return;
      }

      try {
        await perform();
      } catch (error) {
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    };

  const createAdmin = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (
      !newAdminForm.name.trim() ||
      !newAdminForm.mobile.trim() ||
      !newAdminForm.role.trim() ||
      !newAdminForm.workingLocation.trim() ||
      !newAdminForm.department.trim() ||
      !newAdminForm.operatingRegion.trim() ||
      !newAdminForm.workAddress.trim() ||
      !newAdminForm.accessReason.trim() ||
      !newAdminResume
    ) {
      showToast(
        "error",
        "Name, mobile and role are required."
      );
      return;
    }

    const perform = async () => {
      setCreateAdminLoading(true);

      try {
        const response =
          await apiRequest<AdminUser>(
            "/admin/admins",
            {
              method: "POST",
              body: JSON.stringify({
                name:
                  newAdminForm.name.trim(),
                mobile:
                  newAdminForm.mobile.trim(),
                email:
                  newAdminForm.email.trim() ||
                  null,
                role:
                  newAdminForm.role
                    .trim()
                    .toUpperCase(),
                requestedRole: newAdminForm.requestedRole.trim().toUpperCase(),
                workingLocation: newAdminForm.workingLocation.trim(),
                department: newAdminForm.department.trim(),
                operatingRegion: newAdminForm.operatingRegion.trim(),
                workAddress: newAdminForm.workAddress.trim(),
                accessReason: newAdminForm.accessReason.trim(),
                confirmation:
                  "CREATE ADMIN",
              }),
            }
          );

        if (newAdminResume && response.data?.id) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Unable to read resume file"));
            reader.readAsDataURL(newAdminResume);
          });
          await apiRequest(`/admin/admins/${encodeURIComponent(response.data.id)}/resume`, {
            method: "POST",
            body: JSON.stringify({ fileName: newAdminResume.name, mimeType: newAdminResume.type || "application/pdf", size: newAdminResume.size, base64 }),
          });
        }

        showToast(
          "success",
          response.message ??
            "Admin created."
        );

        setNewAdminForm({
          name: "",
          mobile: "",
          email: "",
          workingLocation: "",
          department: "",
          operatingRegion: "",
          workAddress: "",
          requestedRole: "OPERATIONS",
          accessReason: "",
          role: "OPERATIONS",
        });
        setNewAdminResume(null);

        await loadAdmins();
        await loadDashboard();
      } finally {
        setCreateAdminLoading(false);
      }
    };

    requestConfirmation(
      "Create Admin User",
      `Create "${newAdminForm.name}" with role ${newAdminForm.role}? The new admin will be placed in Pending Approval.`,
      "CREATE ADMIN",
      perform
    );
  };

  const approveAdmin = (
    admin: AdminUser
  ) => {
    const perform = async () => {
      const response =
        await apiRequest<AdminUser>(
          `/admin/admins/${encodeURIComponent(
            admin.id
          )}/approve`,
          {
            method: "PATCH",
            body: JSON.stringify({
              confirmation:
                "APPROVE ADMIN",
            }),
          }
        );

      showToast(
        "success",
        response.message ??
          "Admin approved."
      );

      await loadAdmins();
      await loadDashboard();
    };

    requestConfirmation(
      "Approve Admin Access",
      `Approve admin "${admin.name ?? admin.id}"? Only a Super Admin can perform this action.`,
      "APPROVE ADMIN",
      perform
    );
  };

  const rejectAdmin = (
    admin: AdminUser
  ) => {
    const perform = async () => {
      const response =
        await apiRequest<AdminUser>(
          `/admin/admins/${encodeURIComponent(
            admin.id
          )}/reject`,
          {
            method: "PATCH",
            body: JSON.stringify({
              confirmation:
                "REJECT ADMIN",
            }),
          }
        );

      showToast(
        "success",
        response.message ??
          "Admin rejected."
      );

      await loadAdmins();
      await loadDashboard();
    };

    requestConfirmation(
      "Reject Admin Access",
      `Reject admin "${admin.name ?? admin.id}"?`,
      "REJECT ADMIN",
      perform
    );
  };

  const suspendAdmin = (
    admin: AdminUser
  ) => {
    const perform = async () => {
      const response =
        await apiRequest<AdminUser>(
          `/admin/admins/${encodeURIComponent(
            admin.id
          )}/suspend`,
          {
            method: "PATCH",
            body: JSON.stringify({
              confirmation:
                "SUSPEND ADMIN",
            }),
          }
        );

      showToast(
        "success",
        response.message ??
          "Admin suspended."
      );

      await loadAdmins();
    };

    requestConfirmation(
      "Suspend Admin",
      `Suspend "${admin.name ?? admin.id}"?`,
      "SUSPEND ADMIN",
      perform
    );
  };

  const reactivateAdmin =
    async (
      admin: AdminUser
    ) => {
      try {
        const response =
          await apiRequest<AdminUser>(
            `/admin/admins/${encodeURIComponent(
              admin.id
            )}/reactivate`,
            {
              method: "PATCH",
              body: JSON.stringify({}),
            }
          );

        showToast(
          "success",
          response.message ??
            "Admin reactivated."
        );

        await loadAdmins();
      } catch (error) {
        showToast(
          "error",
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    };

  const saveRolePermissions =
    async () => {
      if (!selectedRoleId) {
        showToast(
          "error",
          "Select a role first."
        );
        return;
      }

      if (
        selectedPermissionIds.length ===
        0
      ) {
        showToast(
          "error",
          "Select at least one permission."
        );
        return;
      }

      const perform = async () => {
        const response =
          await apiRequest<Role>(
            `/admin/roles/${encodeURIComponent(
              selectedRoleId
            )}/permissions`,
            {
              method: "POST",
              body: JSON.stringify({
                permissionIds:
                  selectedPermissionIds,
                confirmation:
                  "CHANGE PERMISSIONS",
              }),
            }
          );

        showToast(
          "success",
          response.message ??
            "Role permissions updated."
        );

        await loadRoles();
      };

      const role = roles.find(
        (item) =>
          item.id === selectedRoleId
      );

      requestConfirmation(
        "Change Role Permissions",
        `Update permissions for role "${role?.name ?? selectedRoleId}"? This replaces the role's current permission set.`,
        "CHANGE PERMISSIONS",
        perform
      );
    };

  const setupTestPickup =
    () => {
      const perform = async () => {
        setSetupLoading(true);

        try {
          const response =
            await apiRequest(
              "/admin/setup-test-pickup",
              {
                method: "POST",
                body: JSON.stringify({
                  confirmation:
                    "SETUP TEST PICKUP",
                }),
              }
            );

          setServerMessage(
            response.message ??
              "Pickup Truck test driver setup successfully."
          );

          showToast(
            "success",
            response.message ??
              "Pickup Truck test driver setup successfully."
          );

          await loadDashboard();
          await loadDrivers();
        } finally {
          setSetupLoading(false);
        }
      };

      requestConfirmation(
        "Setup Test Pickup Driver",
        "This creates/updates the predefined Pickup Truck test driver, vehicle and online test location.",
        "SETUP TEST PICKUP",
        perform
      );
    };

  const getSelectedRole =
    roles.find(
      (role) =>
        role.id === selectedRoleId
    );

  const permissionGroups =
    useMemo(() => {
      const grouped: Record<
        string,
        Permission[]
      > = {};

      for (const permission of permissions) {
        const module =
          permission.module || "other";

        grouped[module] ??= [];
        grouped[module].push(
          permission
        );
      }

      return Object.entries(grouped)
        .sort(([a], [b]) =>
          a.localeCompare(b)
        )
        .map(
          ([module, items]) => ({
            module,
            items: items.sort(
              (a, b) =>
                a.action.localeCompare(
                  b.action
                )
            ),
          })
        );
    }, [permissions]);

  const togglePermission = (
    permissionId: string
  ) => {
    setSelectedPermissionIds(
      (current) =>
        current.includes(permissionId)
          ? current.filter(
              (id) =>
                id !== permissionId
            )
          : [
              ...current,
              permissionId,
            ]
    );
  };

  const refreshCurrentScreen =
    () => {
      switch (currentScreen) {
        case "matching":
        case "events":
        case "finance":
        case "security":
        case "monitoring":
          // Dedicated blueprint panels own their API loading lifecycle.
          break;
        case "dashboard":
          void loadDashboard();
          break;
        case "drivers":
          void loadDrivers(true);
          break;
        case "bookings":
          void loadBookings();
          break;
        case "customers":
          void loadCustomers();
          break;
        case "safety":
          void loadSafety();
          break;
        case "admins":
          void loadAdmins();
          break;
        case "roles":
          void loadRoles();
          break;
        case "audit":
          void loadAuditLogs();
          break;
        case "quickLocations":
          void loadQuickLocations();
          break;
        case "setup":
          void loadDashboard();
          break;
      }
    };

  const renderDashboard =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Dashboard"
            subtitle="RideX operational overview"
            onRefresh={
              loadDashboard
            }
          />

          {dashboardLoading ? (
            <LoadingState message="Loading dashboard…" />
          ) : dashboardError ? (
            <ErrorState
              message={dashboardError}
              onRetry={loadDashboard}
            />
          ) : dashboard ? (
            <>
              <div className="metrics-grid">
                <MetricCard
                  label="Customers"
                  value={formatNumber(
                    dashboard.customers
                  )}
                  icon="users"
                  onClick={() =>
                    navigate(
                      "customers"
                    )
                  }
                />

                <MetricCard
                  label="Drivers"
                  value={formatNumber(
                    dashboard.drivers
                  )}
                  icon="driver"
                  onClick={() =>
                    navigate(
                      "drivers"
                    )
                  }
                />

                <MetricCard
                  label="Online Drivers"
                  value={formatNumber(
                    dashboard.activeDrivers
                  )}
                  icon="activity"
                  onClick={() =>
                    navigate(
                      "drivers"
                    )
                  }
                />

                <MetricCard
                  label="All Bookings"
                  value={formatNumber(
                    dashboard.bookings
                  )}
                  icon="receipt"
                  onClick={() =>
                    navigate(
                      "bookings"
                    )
                  }
                />

                <MetricCard
                  label="Completed"
                  value={formatNumber(
                    dashboard.completed
                  )}
                  icon="check"
                  onClick={() =>
                    navigate(
                      "bookings"
                    )
                  }
                />

                <MetricCard
                  label="Ongoing"
                  value={formatNumber(
                    dashboard.ongoing
                  )}
                  icon="route"
                  onClick={() =>
                    navigate(
                      "bookings"
                    )
                  }
                />

                <MetricCard
                  label="Cancelled"
                  value={formatNumber(
                    dashboard.cancelled
                  )}
                  icon="close"
                  onClick={() =>
                    navigate(
                      "bookings"
                    )
                  }
                />

                <MetricCard
                  label="Open SOS"
                  value={formatNumber(
                    dashboard.sos
                  )}
                  icon="safety"
                  onClick={() =>
                    navigate(
                      "safety"
                    )
                  }
                />

                <MetricCard
                  label="Vehicles"
                  value={formatNumber(
                    dashboard.vehicles
                  )}
                  icon="vehicle"
                  onClick={() =>
                    navigate(
                      "vehicles"
                    )
                  }
                />

                <MetricCard
                  label="Pending KYC"
                  value={formatNumber(
                    dashboard.pendingKyc
                  )}
                  icon="file"
                  onClick={() =>
                    navigate(
                      "drivers"
                    )
                  }
                />

                <MetricCard
                  label="Pending Admins"
                  value={formatNumber(
                    dashboard.pendingAdmins
                  )}
                  icon="roles"
                  onClick={() =>
                    navigate(
                      "admins"
                    )
                  }
                />

                <MetricCard
                  label="Open Support"
                  value={formatNumber(
                    dashboard.openSupport
                  )}
                  icon="support"
                />
              </div>

              <div className="content-grid two">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">
                        Operations
                      </p>
                      <h3>
                        Live platform summary
                      </h3>
                    </div>
                  </div>

                  <div className="summary-list">
                    <div>
                      <span>
                        Online driver ratio
                      </span>
                      <strong>
                        {dashboard.drivers
                          ? `${Math.round(
                              (dashboard.activeDrivers /
                                dashboard.drivers) *
                                100
                            )}%`
                          : "0%"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Completion ratio
                      </span>
                      <strong>
                        {dashboard.bookings
                          ? `${Math.round(
                              (dashboard.completed /
                                dashboard.bookings) *
                                100
                            )}%`
                          : "0%"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Pending KYC / drivers
                      </span>
                      <strong>
                        {formatNumber(
                          dashboard.pendingKyc
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Pending admin approvals
                      </span>
                      <strong>
                        {formatNumber(
                          dashboard.pendingAdmins
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">
                        Quick actions
                      </p>
                      <h3>
                        Operations shortcuts
                      </h3>
                    </div>
                  </div>

                  <div className="quick-actions">
                    <button
                      className="button primary"
                      type="button"
                      onClick={() =>
                        navigate("drivers")
                      }
                    >
                      Review Drivers
                    </button>

                    <button
                      className="button secondary"
                      type="button"
                      onClick={() =>
                        navigate("bookings")
                      }
                    >
                      Open Bookings
                    </button>

                    <button
                      className="button secondary"
                      type="button"
                      onClick={() =>
                        navigate("safety")
                      }
                    >
                      Review SOS
                    </button>

                    <button
                      className="button secondary"
                      type="button"
                      onClick={() =>
                        navigate("admins")
                      }
                    >
                      Manage Admins
                    </button>

                    <button
                      className="button secondary"
                      type="button"
                      onClick={() =>
                        navigate("setup")
                      }
                    >
                      Test Pickup Setup
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="No dashboard data"
              message="Connect a valid approved admin user and refresh."
            />
          )}
        </div>
      );
    };

  const renderDrivers =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Drivers"
            subtitle="Driver list, KYC verification and operational status"
            onRefresh={
              loadDrivers
            }
            right={
              <div className="inline-filters">
                <select
                  className="select-input"
                  value={
                    driverVerificationFilter
                  }
                  onChange={(event) =>
                    setDriverVerificationFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All verification
                  </option>

                  {VERIFICATION_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {humanize(status)}
                      </option>
                    )
                  )}
                </select>

                <select
                  className="select-input"
                  value={
                    driverStatusFilter
                  }
                  onChange={(event) =>
                    setDriverStatusFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All driver status
                  </option>

                  {DRIVER_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {humanize(status)}
                      </option>
                    )
                  )}
                </select>

                <button
                  className="button primary"
                  type="button"
                  onClick={() => void loadDrivers()}
                >
                  Apply
                </button>
              </div>
            }
          />

          {driversLoading ? (
            <LoadingState message="Loading drivers…" />
          ) : driversError ? (
            <ErrorState
              message={driversError}
              onRetry={loadDrivers}
            />
          ) : drivers.length === 0 ? (
            <EmptyState
              title="No drivers found"
              message="No driver matches the current filters."
            />
          ) : (
            <div className="panel">
              <div className="table-topbar">
                <PaginationInfo
                  count={drivers.length}
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Driver</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th>Mode</th>
                      <th>Rating</th>
                      <th>Vehicles</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {drivers.map(
                      (driver) => (
                        <tr
                          key={driver.id}
                        >
                          <td>
                            <button
                              type="button"
                              className="table-link"
                              onClick={() =>
                                void loadDriverDetails(
                                  driver.id
                                )
                              }
                            >
                              {driver.fullName ??
                                "Unnamed driver"}
                            </button>

                            <span className="cell-sub">
                              {shortId(
                                driver.id
                              )}
                            </span>
                          </td>

                          <td>
                            <select
                              className="table-select"
                              value={
                                driver.verificationStatus ??
                                "PENDING"
                              }
                              onChange={(event) =>
                                void updateDriverVerification(
                                  driver,
                                  event.target
                                    .value
                                )
                              }
                            >
                              {VERIFICATION_STATUSES.map(
                                (
                                  status
                                ) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {humanize(
                                      status
                                    )}
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          <td>
                            <Badge
                              value={
                                driver.driverStatus
                              }
                            />
                          </td>

                          <td>
                            {humanize(
                              driver.dailyServiceMode
                            )}
                          </td>

                          <td>
                            ⭐{" "}
                            {Number(
                              driver.rating ??
                                0
                            ).toFixed(1)}
                          </td>

                          <td>
                            {formatNumber(
                              driver
                                .vehicles
                                ?.length ??
                                0
                            )}
                          </td>

                          <td>
                            {driver.location ? (
                              <span className="cell-sub">
                                {Number(
                                  driver
                                    .location
                                    .latitude ??
                                    0
                                ).toFixed(
                                  4
                                )}
                                ,{" "}
                                {Number(
                                  driver
                                    .location
                                    .longitude ??
                                    0
                                ).toFixed(
                                  4
                                )}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td>
                            <div className="row-actions">
                              <button
                                className="button small secondary"
                                type="button"
                                onClick={() =>
                                  void loadDriverDetails(
                                    driver.id
                                  )
                                }
                              >
                                View
                              </button>

                              <select
                                className="table-select action-select"
                                value={
                                  driver.driverStatus ??
                                  "OFFLINE"
                                }
                                onChange={(
                                  event
                                ) =>
                                  void updateDriverStatus(
                                    driver,
                                    event
                                      .target
                                      .value
                                  )
                                }
                              >
                                {DRIVER_STATUSES.map(
                                  (
                                    status
                                  ) => (
                                    <option
                                      key={
                                        status
                                      }
                                      value={
                                        status
                                      }
                                    >
                                      {humanize(
                                        status
                                      )}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    };

  const renderDriverDrawer =
    () => {
      if (!selectedDriver) {
        return null;
      }

      const driver =
        selectedDriver;

      return (
        <Drawer
          title={
            driver.fullName ??
            "Driver Details"
          }
          onClose={() =>
            setSelectedDriver(
              null
            )
          }
        >
          <div className="detail-grid">
            <div>
              <span>ID</span>
              <strong>
                {driver.id}
              </strong>
            </div>

            <div>
              <span>User ID</span>
              <strong>
                {driver.userId ??
                  "—"}
              </strong>
            </div>

            <div>
              <span>Verification</span>
              <Badge
                value={
                  driver.verificationStatus
                }
              />
            </div>

            <div>
              <span>Status</span>
              <Badge
                value={
                  driver.driverStatus
                }
              />
            </div>

            <div>
              <span>Service mode</span>
              <strong>
                {humanize(
                  driver.dailyServiceMode
                )}
              </strong>
            </div>

            <div>
              <span>Rating</span>
              <strong>
                ⭐{" "}
                {Number(
                  driver.rating ?? 0
                ).toFixed(1)}
              </strong>
            </div>

            <div>
              <span>Total rides</span>
              <strong>
                {formatNumber(
                  driver.totalRides
                )}
              </strong>
            </div>

            <div>
              <span>Created</span>
              <strong>
                {formatDate(
                  driver.createdAt
                )}
              </strong>
            </div>
          </div>

          <div className="drawer-section">
            <h3>Verification</h3>

            <div className="stack">
              {VERIFICATION_STATUSES.map(
                (status) => (
                  <button
                    key={status}
                    className={`button ${
                      driver.verificationStatus ===
                      status
                        ? "primary"
                        : "secondary"
                    }`}
                    type="button"
                    onClick={() =>
                      void updateDriverVerification(
                        driver,
                        status
                      )
                    }
                  >
                    {humanize(status)}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="drawer-section">
            <h3>KYC Documents</h3>
            <div className="stack">
              {safeArray<NonNullable<Driver["documents"]>[number]>(driver.documents).length === 0 ? (
                <div className="empty-state">No KYC documents uploaded.</div>
              ) : safeArray<NonNullable<Driver["documents"]>[number]>(driver.documents).map((doc) => (
                <div key={doc.id} className="card" style={{padding:12}}>
                  <div className="split-row">
                    <strong>{humanize(doc.documentType ?? 'DOCUMENT')}</strong>
                    <Badge value={doc.status} />
                  </div>
                  <div className="muted" style={{marginTop:6}}>Number: {doc.documentNumber ?? '—'}</div>
                  {doc.rejectionReason ? <div className="muted" style={{marginTop:6}}>Reason: {doc.rejectionReason}</div> : null}
                  <div className="button-row" style={{marginTop:10}}>
                    {doc.fileUrl ? (
                      <button className="button secondary small" type="button" onClick={() => void (async()=>{
                        try {
                          const r=await apiRequest<{url:string}>(`/admin/drivers/${encodeURIComponent(driver.id)}/documents/${encodeURIComponent(doc.id)}/url`);
                          if(r.data?.url) window.open(r.data.url,'_blank','noopener,noreferrer');
                        } catch(error) { showToast('error',error instanceof Error?error.message:String(error)); }
                      })()}>View</button>
                    ) : null}
                    <button className="button secondary small" type="button" onClick={() => void (async()=>{
                      try {
                        await apiRequest(`/admin/drivers/${encodeURIComponent(driver.id)}/documents/${encodeURIComponent(doc.id)}/review`,{method:'PATCH',body:JSON.stringify({status:'UNDER_REVIEW'})});
                        showToast('success','Document marked under review.');
                        await loadDrivers();
                      } catch(error) { showToast('error',error instanceof Error?error.message:String(error)); }
                    })()}>Review</button>
                    <button className="button primary small" type="button" onClick={() => void (async()=>{
                      try {
                        await apiRequest(`/admin/drivers/${encodeURIComponent(driver.id)}/documents/${encodeURIComponent(doc.id)}/review`,{method:'PATCH',body:JSON.stringify({status:'APPROVED'})});
                        showToast('success','Document approved.');
                        await loadDrivers();
                      } catch(error) { showToast('error',error instanceof Error?error.message:String(error)); }
                    })()} >Approve</button>
                    <button className="button danger small" type="button" onClick={() => {
                      const reason = window.prompt('Rejection reason');
                      if (!reason?.trim()) return;
                      void (async()=>{
                        try {
                          await apiRequest(`/admin/drivers/${encodeURIComponent(driver.id)}/documents/${encodeURIComponent(doc.id)}/review`,{method:'PATCH',body:JSON.stringify({status:'REJECTED',rejectionReason:reason.trim()})});
                          showToast('success','Document rejected.');
                          await loadDrivers();
                        } catch(error) { showToast('error',error instanceof Error?error.message:String(error)); }
                      })();
                    }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="drawer-section">
            <h3>Driver status</h3>

            <div className="stack">
              {DRIVER_STATUSES.map(
                (status) => (
                  <button
                    key={status}
                    className={`button ${
                      driver.driverStatus ===
                      status
                        ? "primary"
                        : "secondary"
                    }`}
                    type="button"
                    onClick={() =>
                      void updateDriverStatus(
                        driver,
                        status
                      )
                    }
                  >
                    {humanize(status)}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="drawer-section">
            <h3>Location</h3>

            {driver.location ? (
              <div className="detail-grid">
                <div>
                  <span>Latitude</span>
                  <strong>
                    {displayValue(
                      driver
                        .location
                        .latitude
                    )}
                  </strong>
                </div>

                <div>
                  <span>Longitude</span>
                  <strong>
                    {displayValue(
                      driver
                        .location
                        .longitude
                    )}
                  </strong>
                </div>

                <div>
                  <span>Online</span>
                  <strong>
                    {driver.location
                      .isOnline
                      ? "Yes"
                      : "No"}
                  </strong>
                </div>

                <div>
                  <span>Recorded</span>
                  <strong>
                    {formatDate(
                      driver
                        .location
                        .recordedAt
                    )}
                  </strong>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No location"
                message="No driver location record is currently available."
              />
            )}
          </div>

          <div className="drawer-section">
            <h3>Vehicles</h3>

            {driver.vehicles &&
            driver.vehicles.length > 0 ? (
              <div className="mini-list">
                {driver.vehicles.map(
                  (vehicle) => (
                    <div
                      className="mini-card"
                      key={
                        vehicle.id ??
                        `${vehicle.vehicleNumber}`
                      }
                    >
                      <strong>
                        {humanize(
                          vehicle.vehicleType
                        )}
                      </strong>
                      <span>
                        {vehicle.vehicleNumber ??
                          "—"}
                      </span>
                      <span>
                        Capacity:{" "}
                        {displayValue(
                          vehicle.capacity
                        )}
                      </span>
                      <Badge
                        value={
                          vehicle.status
                        }
                      />
                    </div>
                  )
                )}
              </div>
            ) : (
              <EmptyState
                title="No vehicles"
                message="No vehicle is attached to this driver."
              />
            )}
          </div>
        </Drawer>
      );
    };

  const renderVehicles = () => {
    const vehicleRows = drivers.flatMap((driver) =>
      (driver.vehicles ?? []).map((vehicle) => ({
        ...vehicle,
        driverName: driver.fullName ?? "Unassigned",
        driverStatus: driver.driverStatus ?? "OFFLINE",
      }))
    );

    const activeVehicles = vehicleRows.filter(
      (vehicle) => String(vehicle.status ?? "").toUpperCase() === "ACTIVE"
    );
    const eRickshaws = vehicleRows.filter(
      (vehicle) => String(vehicle.vehicleType ?? "").toUpperCase() === "E_RICKSHAW"
    );
    const goodsVehicles = vehicleRows.filter((vehicle) => Boolean(vehicle.goodsEligible));

    return (
      <div className="page">
        <SectionHeader
          title="Vehicles / E-Rickshaws"
          subtitle="Live vehicle inventory and driver assignment from backend"
          onRefresh={loadDrivers}
          right={
            <span className="api-pill">
              <span className="online-dot" /> API Live Data
            </span>
          }
        />

        <div className="metrics-grid">
          <MetricCard
            label="Total Vehicles"
            value={formatNumber(vehicleRows.length)}
            icon="vehicle"
            tone="neutral"
          />
          <MetricCard
            label="Active"
            value={formatNumber(activeVehicles.length)}
            icon="check"
            tone="success"
          />
          <MetricCard
            label="E-Rickshaws"
            value={formatNumber(eRickshaws.length)}
            icon="vehicle"
            tone="info"
          />
          <MetricCard
            label="Goods Eligible"
            value={formatNumber(goodsVehicles.length)}
            icon="vehicle"
            tone="warning"
          />
        </div>

        <Panel
          title="Vehicle Inventory"
          subtitle={`${vehicleRows.length} vehicle(s) loaded from backend`}
        >
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Driver</th>
                  <th>Driver Status</th>
                  <th>Capacity</th>
                  <th>Goods</th>
                  <th>Vehicle Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicleRows.map((vehicle) => (
                  <tr
                    key={
                      vehicle.id ??
                      `${vehicle.driverName}-${vehicle.vehicleNumber ?? "vehicle"}`
                    }
                  >
                    <td>
                      <strong>{vehicle.vehicleNumber ?? "—"}</strong>
                      <div className="cell-sub">
                        {shortId(vehicle.id ?? "", 16)}
                      </div>
                    </td>
                    <td>{humanize(vehicle.vehicleType ?? "UNKNOWN")}</td>
                    <td>{vehicle.driverName}</td>
                    <td>
                      <StatusBadge value={humanize(vehicle.driverStatus)} />
                    </td>
                    <td>{displayValue(vehicle.capacity)}</td>
                    <td>
                      <StatusBadge
                        value={vehicle.goodsEligible ? "Eligible" : "No"}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        value={humanize(vehicle.status ?? "UNKNOWN")}
                      />
                    </td>
                  </tr>
                ))}
                {vehicleRows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title="No vehicles"
                        message="No vehicle records are currently attached to backend drivers."
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    );
  };

  const renderReports = () => {
    const statusCounts = bookings.reduce<Record<string, number>>(
      (counts, booking) => {
        const status = String(booking.status ?? "UNKNOWN").toUpperCase();
        counts[status] = (counts[status] ?? 0) + 1;
        return counts;
      },
      {}
    );

    const serviceCounts = bookings.reduce<Record<string, number>>(
      (counts, booking) => {
        const service = String(booking.serviceType ?? "UNKNOWN").toUpperCase();
        counts[service] = (counts[service] ?? 0) + 1;
        return counts;
      },
      {}
    );

    const vehicleCount = drivers.reduce(
      (count, driver) => count + (driver.vehicles?.length ?? 0),
      0
    );
    const activeDrivers = drivers.filter((driver) =>
      ["ONLINE", "ON_TRIP"].includes(
        String(driver.driverStatus ?? "").toUpperCase()
      )
    ).length;

    const totalBookings =
      bookings.length || Number(dashboard?.bookings ?? 0);
    const completedBookings = Number(
      statusCounts.COMPLETED ?? dashboard?.completed ?? 0
    );
    const cancelledBookings = Number(
      statusCounts.CANCELLED ?? dashboard?.cancelled ?? 0
    );
    const completionRate =
      totalBookings > 0
        ? `${Math.round((completedBookings / totalBookings) * 100)}%`
        : "0%";

    return (
      <div className="page">
        <SectionHeader
          title="Reports & Analytics"
          subtitle="Operational metrics calculated from live RideX backend data"
          onRefresh={() => {
            void loadDashboard();
            void loadBookings();
            void loadDrivers(true);
          }}
          right={
            <span className="api-pill">
              <span className="online-dot" /> API Live Data
            </span>
          }
        />

        <div className="metrics-grid">
          <MetricCard label="Total Bookings" value={formatNumber(totalBookings)} icon="list" tone="neutral" />
          <MetricCard label="Completed" value={formatNumber(completedBookings)} icon="check" tone="success" />
          <MetricCard label="Cancelled" value={formatNumber(cancelledBookings)} icon="close" tone="danger" />
          <MetricCard label="Completion Rate" value={completionRate} icon="chart" tone="info" />
          <MetricCard label="Active Drivers" value={formatNumber(activeDrivers)} icon="driver" tone="success" />
          <MetricCard label="Vehicles" value={formatNumber(vehicleCount)} icon="vehicle" tone="neutral" />
        </div>

        <div className="content-grid two">
          <Panel title="Booking Status" subtitle="Current booking distribution">
            <div className="stack-list">
              {Object.entries(statusCounts).length === 0 ? (
                <div className="muted">No booking records loaded.</div>
              ) : (
                (Object.entries(statusCounts) as [string, number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <div className="list-row" key={status}>
                      <strong>{humanize(status)}</strong>
                      <span>{formatNumber(count)}</span>
                    </div>
                  ))
              )}
            </div>
          </Panel>

          <Panel title="Service Mix" subtitle="Passenger / goods distribution">
            <div className="stack-list">
              {Object.entries(serviceCounts).length === 0 ? (
                <div className="muted">No service records loaded.</div>
              ) : (
                (Object.entries(serviceCounts) as [string, number][])
                  .sort(([, a], [, b]) => b - a)
                  .map(([service, count]) => (
                    <div className="list-row" key={service}>
                      <strong>{humanize(service)}</strong>
                      <span>{formatNumber(count)}</span>
                    </div>
                  ))
              )}
            </div>
          </Panel>
        </div>

        <Panel
          title="Operational Snapshot"
          subtitle="Live counts used by admin operations"
        >
          <div className="detail-grid">
            <div>
              <span className="field-label">Dashboard bookings</span>
              <strong>{formatNumber(dashboard?.bookings ?? totalBookings)}</strong>
            </div>
            <div>
              <span className="field-label">Dashboard ongoing</span>
              <strong>{formatNumber(dashboard?.ongoing ?? 0)}</strong>
            </div>
            <div>
              <span className="field-label">Dashboard customers</span>
              <strong>{formatNumber(dashboard?.customers ?? 0)}</strong>
            </div>
            <div>
              <span className="field-label">Dashboard vehicles</span>
              <strong>{formatNumber(dashboard?.vehicles ?? vehicleCount)}</strong>
            </div>
          </div>
        </Panel>
      </div>
    );
  };

  const renderBookings =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Bookings"
            subtitle="Booking-level operations with Connection Ride leg visibility"
            onRefresh={
              loadBookings
            }
            right={
              <div className="inline-filters">
                <input
                  className="text-input compact"
                  value={
                    bookingStatusFilter
                  }
                  onChange={(event) =>
                    setBookingStatusFilter(
                      event.target.value
                    )
                  }
                  placeholder="Status e.g. COMPLETED"
                />

                <button
                  className="button primary"
                  type="button"
                  onClick={loadBookings}
                >
                  Apply
                </button>
              </div>
            }
          />

          {bookingsLoading ? (
            <LoadingState message="Loading bookings…" />
          ) : bookingsError ? (
            <ErrorState
              message={bookingsError}
              onRetry={loadBookings}
            />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="No bookings"
              message="No bookings match the current filter."
            />
          ) : (
            <div className="panel">
              <div className="table-topbar">
                <PaginationInfo
                  count={bookings.length}
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>Customer</th>
                      <th>Driver</th>
                      <th>Fare</th>
                      <th>Legs</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map(
                      (booking) => (
                        <tr
                          key={booking.id}
                        >
                          <td>
                            <button
                              className="table-link"
                              type="button"
                              onClick={() =>
                                void loadBookingDetails(
                                  booking.id
                                )
                              }
                            >
                              {shortId(
                                booking.id,
                                18
                              )}
                            </button>

                            <span className="cell-sub">
                              {booking
                                .pickupAddress ??
                                "—"}{" "}
                              →{" "}
                              {booking
                                .dropAddress ??
                                "—"}
                            </span>
                          </td>

                          <td>
                            <Badge
                              value={
                                booking.status
                              }
                            />
                          </td>

                          <td>
                            <span className="tag">
                              {humanize(
                                booking.rideType
                              )}
                            </span>
                            <span className="tag">
                              {humanize(
                                booking.serviceType
                              )}
                            </span>
                          </td>

                          <td>
                            {booking
                              .customer
                              ?.id
                              ? shortId(
                                  booking
                                    .customer
                                    .id
                                )
                              : shortId(
                                  booking.customerId
                                )}
                          </td>

                          <td>
                            {booking
                              .assignedDriver
                              ?.fullName ??
                              shortId(
                                booking.assignedDriverId
                              )}
                          </td>

                          <td>
                            {formatMoney(
                              booking.finalFare ??
                                booking.totalFare ??
                                booking.estimatedFare
                            )}
                          </td>

                          <td>
                            {booking.legs
                              ?.length ??
                              0}

                            {booking.legs &&
                            booking.legs.length >
                              1 ? (
                              <span className="cell-sub">
                                Connection
                              </span>
                            ) : null}
                          </td>

                          <td>
                            {formatDate(
                              booking.createdAt
                            )}
                          </td>

                          <td>
                            <button
                              className="button small secondary"
                              type="button"
                              onClick={() =>
                                void loadBookingDetails(
                                  booking.id
                                )
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    };

  const renderBookingDrawer =
    () => {
      if (!selectedBooking) {
        return null;
      }

      const booking =
        selectedBooking;

      return (
        <Drawer
          title={`Booking ${shortId(
            booking.id,
            22
          )}`}
          onClose={() =>
            setSelectedBooking(
              null
            )
          }
        >
          <div className="detail-grid">
            <div>
              <span>Status</span>
              <Badge
                value={
                  booking.status
                }
              />
            </div>

            <div>
              <span>Ride type</span>
              <strong>
                {humanize(
                  booking.rideType
                )}
              </strong>
            </div>

            <div>
              <span>Service type</span>
              <strong>
                {humanize(
                  booking.serviceType
                )}
              </strong>
            </div>

            <div>
              <span>Customer</span>
              <strong>
                {booking.customer
                  ?.id ??
                  booking.customerId ??
                  "—"}
              </strong>
            </div>

            <div>
              <span>Assigned driver</span>
              <strong>
                {booking
                  .assignedDriver
                  ?.fullName ??
                  booking.assignedDriverId ??
                  "—"}
              </strong>
            </div>

            <div>
              <span>Vehicle</span>
              <strong>
                {booking.vehicle
                  ?.vehicleNumber ??
                  booking.vehicleId ??
                  "—"}
              </strong>
            </div>

            <div>
              <span>Estimated fare</span>
              <strong>
                {formatMoney(
                  booking.estimatedFare
                )}
              </strong>
            </div>

            <div>
              <span>Final fare</span>
              <strong>
                {formatMoney(
                  booking.finalFare ??
                    booking.totalFare
                )}
              </strong>
            </div>
          </div>

          <div className="drawer-section">
            <h3>Full journey</h3>

            <div className="journey-card">
              <div>
                <span>Pickup</span>
                <strong>
                  {booking.pickupAddress ??
                    "—"}
                </strong>
              </div>

              <div className="journey-arrow">
                ↓
              </div>

              <div>
                <span>Drop</span>
                <strong>
                  {booking.dropAddress ??
                    "—"}
                </strong>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">
              <h3>
                Legs (
                {booking.legs
                  ?.length ?? 0}
                )
              </h3>

              {booking.legs &&
              booking.legs.length >
                1 ? (
                <span className="tag emphasis">
                  CONNECTION RIDE
                </span>
              ) : null}
            </div>

            {booking.legs &&
            booking.legs.length > 0 ? (
              <div className="leg-list">
                {booking.legs
                  .slice()
                  .sort(
                    (a, b) =>
                      Number(
                        a.legNumber ??
                          0
                      ) -
                      Number(
                        b.legNumber ??
                          0
                      )
                  )
                  .map(
                    (leg, index) => (
                      <div
                        className="leg-card"
                        key={
                          leg.id
                        }
                      >
                        <div className="leg-header">
                          <div>
                            <span className="leg-number">
                              LEG{" "}
                              {leg.legNumber ??
                                index +
                                  1}
                            </span>

                            <h4>
                              {leg.pickupAddress ??
                                "Pickup"}{" "}
                              →{" "}
                              {leg.dropAddress ??
                                "Drop"}
                            </h4>
                          </div>

                          <Badge
                            value={
                              leg.status
                            }
                          />
                        </div>

                        <div className="detail-grid compact-grid">
                          <div>
                            <span>
                              Driver
                            </span>
                            <strong>
                              {leg.assignedDriverId ??
                                "Not assigned"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Vehicle
                            </span>
                            <strong>
                              {leg.vehicleId ??
                                "Not assigned"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Fare
                            </span>
                            <strong>
                              {formatMoney(
                                leg.fare
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Distance
                            </span>
                            <strong>
                              {leg.distanceKm !=
                              null
                                ? `${Number(
                                    leg.distanceKm
                                  ).toFixed(
                                    2
                                  )} km`
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Duration
                            </span>
                            <strong>
                              {leg.durationMinutes !=
                              null
                                ? `${Number(
                                    leg.durationMinutes
                                  ).toFixed(
                                    0
                                  )} min`
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Trip
                            </span>
                            <strong>
                              {leg.tripId ??
                                "Not started"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <EmptyState
                title="No legs"
                message="This booking has no BookingLeg records."
              />
            )}
          </div>

          <div className="drawer-section">
            <h3>
              Ride requests
            </h3>

            <JsonBlock
              value={
                booking.rideRequests ??
                []
              }
            />
          </div>

          <div className="drawer-section">
            <h3>Payment</h3>

            <JsonBlock
              value={
                booking.payment ??
                null
              }
            />
          </div>

          <div className="drawer-section">
            <h3>Ratings</h3>

            <JsonBlock
              value={
                booking.ratings ?? []
              }
            />
          </div>
        </Drawer>
      );
    };

  const renderCustomers =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Customers"
            subtitle="Customer profiles and recent account activity"
            onRefresh={
              loadCustomers
            }
          />

          {customersLoading ? (
            <LoadingState message="Loading customers…" />
          ) : customersError ? (
            <ErrorState
              message={customersError}
              onRetry={loadCustomers}
            />
          ) : customers.length === 0 ? (
            <EmptyState
              title="No customers"
              message="No customer records were returned."
            />
          ) : (
            <div className="panel">
              <div className="table-topbar">
                <PaginationInfo
                  count={customers.length}
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>User Status</th>
                      <th>Bookings</th>
                      <th>Ratings</th>
                      <th>SOS</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map(
                      (customer) => (
                        <tr
                          key={
                            customer.id
                          }
                        >
                          <td>
                            <button
                              className="table-link"
                              type="button"
                              onClick={() =>
                                void loadCustomerDetails(
                                  customer.id
                                )
                              }
                            >
                              {shortId(
                                customer.id,
                                18
                              )}
                            </button>
                          </td>

                          <td>
                            {customer
                              .user
                              ?.mobile ??
                              "—"}
                          </td>

                          <td>
                            {customer
                              .user
                              ?.email ??
                              "—"}
                          </td>

                          <td>
                            <Badge
                              value={
                                customer
                                  .user
                                  ?.status
                              }
                            />
                          </td>

                          <td>
                            {formatNumber(
                              customer
                                .bookings
                                ?.length ??
                                0
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              customer
                                .ratings
                                ?.length ??
                                0
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              customer
                                .sosEvents
                                ?.length ??
                                0
                            )}
                          </td>

                          <td>
                            {formatDate(
                              customer.createdAt
                            )}
                          </td>

                          <td>
                            <button
                              className="button small secondary"
                              type="button"
                              onClick={() =>
                                void loadCustomerDetails(
                                  customer.id
                                )
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    };

  const renderCustomerDrawer =
    () => {
      if (!selectedCustomer) {
        return null;
      }

      const customer =
        selectedCustomer;

      return (
        <Drawer
          title="Customer Details"
          onClose={() =>
            setSelectedCustomer(
              null
            )
          }
        >
          <div className="detail-grid">
            <div>
              <span>Customer ID</span>
              <strong>
                {customer.id}
              </strong>
            </div>

            <div>
              <span>User ID</span>
              <strong>
                {customer.userId ??
                  customer.user
                    ?.id ??
                  "—"}
              </strong>
            </div>

            <div>
              <span>Mobile</span>
              <strong>
                {customer.user
                  ?.mobile ??
                  "—"}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {customer.user
                  ?.email ??
                  "—"}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <Badge
                value={
                  customer.user
                    ?.status
                }
              />
            </div>

            <div>
              <span>Created</span>
              <strong>
                {formatDate(
                  customer.createdAt
                )}
              </strong>
            </div>
          </div>

          <div className="drawer-section">
            <h3>
              Recent Bookings
            </h3>

            {customer.bookings &&
            customer.bookings.length >
              0 ? (
              <div className="mini-list">
                {customer.bookings.map(
                  (booking) => (
                    <button
                      key={
                        booking.id
                      }
                      type="button"
                      className="mini-card clickable-card"
                      onClick={() => {
                        setSelectedCustomer(
                          null
                        );
                        void loadBookingDetails(
                          booking.id
                        );
                      }}
                    >
                      <strong>
                        {shortId(
                          booking.id,
                          20
                        )}
                      </strong>

                      <span>
                        {booking
                          .pickupAddress ??
                          "—"}{" "}
                        →{" "}
                        {booking
                          .dropAddress ??
                          "—"}
                      </span>

                      <Badge
                        value={
                          booking.status
                        }
                      />
                    </button>
                  )
                )}
              </div>
            ) : (
              <EmptyState
                title="No recent bookings"
                message="No booking records are attached to this customer."
              />
            )}
          </div>

          <div className="drawer-section">
            <h3>Ratings</h3>
            <JsonBlock
              value={
                customer.ratings ??
                []
              }
            />
          </div>

          <div className="drawer-section">
            <h3>Support Cases</h3>
            <JsonBlock
              value={
                customer.supportCases ??
                []
              }
            />
          </div>

          <div className="drawer-section">
            <h3>SOS Events</h3>
            <JsonBlock
              value={
                customer.sosEvents ??
                []
              }
            />
          </div>
        </Drawer>
      );
    };

  const renderSafety =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Safety / SOS"
            subtitle="Open and historical SOS events available to admin"
            onRefresh={
              loadSafety
            }
          />

          {safetyLoading ? (
            <LoadingState message="Loading SOS events…" />
          ) : safetyError ? (
            <ErrorState
              message={safetyError}
              onRetry={loadSafety}
            />
          ) : sosEvents.length === 0 ? (
            <EmptyState
              title="No SOS events"
              message="No SOS events were returned by the admin API."
            />
          ) : (
            <div className="panel">
              <div className="table-topbar">
                <PaginationInfo
                  count={sosEvents.length}
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Booking</th>
                      <th>Incident</th>
                      <th>Route</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sosEvents.map(
                      (event) => (
                        <tr
                          key={event.id}
                        >
                          <td>
                            <strong>
                              {shortId(
                                event.id,
                                20
                              )}
                            </strong>
                          </td>

                          <td>
                            <Badge
                              value={
                                event.status
                              }
                            />
                          </td>

                          <td>
                            {event.booking
                              ?.id ??
                              event.bookingId ??
                              "—"}
                          </td>

                          <td>
                            <div className="cell-stack">
                              <Badge
                                value={
                                  event
                                    .incident
                                    ?.status
                                }
                              />

                              <span className="cell-sub">
                                {humanize(
                                  event
                                    .incident
                                    ?.severity
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="cell-sub">
                              {event.booking
                                ?.pickupAddress ??
                                "—"}
                            </span>

                            <span className="cell-sub">
                              ↓{" "}
                              {event.booking
                                ?.dropAddress ??
                                "—"}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              event.createdAt
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    };

  const renderAdmins =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Admin Users"
            subtitle="Admin accounts, approval, suspension and creation"
            onRefresh={
              loadAdmins
            }
          />

          <div className="content-grid two">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">
                    Create
                  </p>
                  <h3>
                    New Admin
                  </h3>
                </div>
              </div>

              <form
                className="form-grid"
                onSubmit={createAdmin}
              >
                <label>
                  <span className="field-label">
                    Name
                  </span>

                  <input
                    className="text-input"
                    value={
                      newAdminForm.name
                    }
                    onChange={(
                      event
                    ) =>
                      setNewAdminForm(
                        (
                          current
                        ) => ({
                          ...current,
                          name:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Admin name"
                  />
                </label>

                <label>
                  <span className="field-label">
                    Mobile
                  </span>

                  <input
                    className="text-input"
                    value={
                      newAdminForm.mobile
                    }
                    onChange={(
                      event
                    ) =>
                      setNewAdminForm(
                        (
                          current
                        ) => ({
                          ...current,
                          mobile:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="10-digit mobile"
                  />
                </label>

                <label>
                  <span className="field-label">
                    Email
                  </span>

                  <input
                    className="text-input"
                    value={
                      newAdminForm.email
                    }
                    onChange={(
                      event
                    ) =>
                      setNewAdminForm(
                        (
                          current
                        ) => ({
                          ...current,
                          email:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Optional email"
                  />
                </label>

                <label>
                  <span className="field-label">Working Location</span>
                  <input className="text-input" value={newAdminForm.workingLocation} onChange={(event) => setNewAdminForm(current => ({...current, workingLocation: event.target.value}))} placeholder="Working location" />
                </label>

                <label>
                  <span className="field-label">Department</span>
                  <input className="text-input" value={newAdminForm.department} onChange={(event) => setNewAdminForm(current => ({...current, department: event.target.value}))} placeholder="Department" />
                </label>

                <label>
                  <span className="field-label">Operating Region / City</span>
                  <input className="text-input" value={newAdminForm.operatingRegion} onChange={(event) => setNewAdminForm(current => ({...current, operatingRegion: event.target.value}))} placeholder="Region / city" />
                </label>

                <label>
                  <span className="field-label">Work Address</span>
                  <input className="text-input" value={newAdminForm.workAddress} onChange={(event) => setNewAdminForm(current => ({...current, workAddress: event.target.value}))} placeholder="Work address" />
                </label>

                <label>
                  <span className="field-label">Reason for Admin Access</span>
                  <textarea className="text-input" value={newAdminForm.accessReason} onChange={(event) => setNewAdminForm(current => ({...current, accessReason: event.target.value}))} placeholder="Reason for admin access" rows={3} />
                </label>

                <label>
                  <span className="field-label">Resume Upload</span>
                  <input className="text-input" type="file" accept="application/pdf,.pdf,.doc,.docx" onChange={(event) => setNewAdminResume(event.target.files?.[0] ?? null)} />
                  <small>{newAdminResume ? newAdminResume.name : "PDF, DOC or DOCX · max 10 MB"}</small>
                </label>

                <label>
                  <span className="field-label">
                    Role
                  </span>

                  <select
                    className="select-input"
                    value={
                      newAdminForm.role
                    }
                    onChange={(
                      event
                    ) =>
                      setNewAdminForm(
                        (
                          current
                        ) => ({
                          ...current,
                          role:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  >
                    {ADMIN_ROLES.map(
                      (role) => (
                        <option
                          key={role}
                          value={role}
                        >
                          {humanize(
                            role
                          )}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <button
                  className="button primary"
                  type="submit"
                  disabled={
                    createAdminLoading
                  }
                >
                  {createAdminLoading
                    ? "Creating…"
                    : "Create Admin"}
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">
                    Current admin
                  </p>
                  <h3>
                    Access Context
                  </h3>
                </div>
              </div>

              <div className="summary-list">
                <div>
                  <span>
                    Admin User ID
                  </span>

                  <strong>
                    {adminUserId ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    API Base
                  </span>

                  <strong className="wrap">
                    {effectiveApiBase}
                  </strong>
                </div>

                <div>
                  <span>
                    Admin records
                  </span>

                  <strong>
                    {formatNumber(
                      adminUsers.length
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Pending approvals
                  </span>

                  <strong>
                    {formatNumber(
                      adminUsers.filter(
                        (admin) =>
                          admin.approvalStatus ===
                          "PENDING"
                      ).length
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {adminsLoading ? (
            <LoadingState message="Loading admin users…" />
          ) : adminsError ? (
            <ErrorState
              message={adminsError}
              onRetry={loadAdmins}
            />
          ) : adminUsers.length === 0 ? (
            <EmptyState
              title="No admin users"
              message="No admin accounts were returned."
            />
          ) : (
            <div className="panel">
              <div className="table-topbar">
                <PaginationInfo
                  count={
                    adminUsers.length
                  }
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Role</th>
                      <th>Approval</th>
                      <th>User Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminUsers.map(
                      (admin) => (
                        <tr
                          key={
                            admin.id
                          }
                        >
                          <td>
                            <strong>
                              {admin.name ??
                                "—"}
                            </strong>

                            <span className="cell-sub">
                              {shortId(
                                admin.id,
                                18
                              )}
                            </span>
                          </td>

                          <td>
                            {admin.user
                              ?.mobile ??
                              "—"}
                          </td>

                          <td>
                            <span className="tag">
                              {humanize(
                                admin
                                  .role
                                  ?.name
                              )}
                            </span>
                          </td>

                          <td>
                            <Badge
                              value={
                                admin.approvalStatus
                              }
                            />
                          </td>

                          <td>
                            <Badge
                              value={
                                admin.user
                                  ?.status
                              }
                            />
                          </td>

                          <td>
                            {formatDate(
                              admin.createdAt
                            )}
                          </td>

                          <td>
                            <div className="row-actions wrap-actions">
                              {admin.approvalStatus ===
                              "PENDING" ? (
                                <>
                                  <button
                                    className="button small primary"
                                    type="button"
                                    onClick={() =>
                                      approveAdmin(
                                        admin
                                      )
                                    }
                                  >
                                    Approve
                                  </button>

                                  <button
                                    className="button small danger-outline"
                                    type="button"
                                    onClick={() =>
                                      rejectAdmin(
                                        admin
                                      )
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : null}

                              {admin.approvalStatus ===
                              "APPROVED" ? (
                                <button
                                  className="button small danger-outline"
                                  type="button"
                                  onClick={() =>
                                    suspendAdmin(
                                      admin
                                    )
                                  }
                                  disabled={
                                    admin.id ===
                                    adminUserId
                                  }
                                >
                                  Suspend
                                </button>
                              ) : null}

                              {admin.approvalStatus ===
                              "SUSPENDED" ? (
                                <button
                                  className="button small secondary"
                                  type="button"
                                  onClick={() =>
                                    void reactivateAdmin(
                                      admin
                                    )
                                  }
                                >
                                  Reactivate
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    };

  const renderRoles =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Roles & Permissions"
            subtitle="Inspect roles and replace role permission assignments"
            onRefresh={
              loadRoles
            }
          />

          {rolesLoading ? (
            <LoadingState message="Loading roles and permissions…" />
          ) : rolesError ? (
            <ErrorState
              message={rolesError}
              onRetry={loadRoles}
            />
          ) : (
            <div className="content-grid two">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      Roles
                    </p>
                    <h3>
                      Select role
                    </h3>
                  </div>
                </div>

                {roles.length ===
                0 ? (
                  <EmptyState
                    title="No roles"
                    message="No roles are configured."
                  />
                ) : (
                  <div className="role-list">
                    {roles.map(
                      (role) => {
                        const count =
                          role
                            .permissionLinks
                            ?.length ??
                          0;

                        return (
                          <button
                            key={
                              role.id
                            }
                            type="button"
                            className={`role-card ${
                              selectedRoleId ===
                              role.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedRoleId(
                                role.id
                              )
                            }
                          >
                            <div>
                              <strong>
                                {humanize(
                                  role.name
                                )}
                              </strong>

                              <span>
                                {count} permission
                                {count ===
                                1
                                  ? ""
                                  : "s"}
                              </span>
                            </div>

                            <div className="role-meta">
                              {role.isSystem ? (
                                <span className="tag">
                                  SYSTEM
                                </span>
                              ) : null}

                              <span>
                                {role
                                  .admins
                                  ?.length ??
                                  0}{" "}
                                admin
                                {(
                                  role
                                    .admins
                                    ?.length ??
                                  0
                                ) === 1
                                  ? ""
                                  : "s"}
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">
                      Permission assignment
                    </p>
                    <h3>
                      {getSelectedRole
                        ? humanize(
                            getSelectedRole.name
                          )
                        : "Select a role"}
                    </h3>
                  </div>

                  <span className="tag emphasis">
                    {
                      selectedPermissionIds.length
                    }{" "}
                    selected
                  </span>
                </div>

                {!selectedRoleId ? (
                  <EmptyState
                    title="Select a role"
                    message="Choose a role from the left panel."
                  />
                ) : permissionGroups.length ===
                  0 ? (
                  <EmptyState
                    title="No permissions"
                    message="No permissions are configured."
                  />
                ) : (
                  <>
                    <div className="permission-groups">
                      {permissionGroups.map(
                        ({
                          module,
                          items,
                        }) => (
                          <div
                            className="permission-group"
                            key={
                              module
                            }
                          >
                            <div className="permission-group-header">
                              <h4>
                                {humanize(
                                  module
                                )}
                              </h4>

                              <span>
                                {
                                  items.length
                                }
                              </span>
                            </div>

                            <div className="permission-grid">
                              {items.map(
                                (
                                  permission
                                ) => (
                                  <label
                                    key={
                                      permission.id
                                    }
                                    className="permission-card"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPermissionIds.includes(
                                        permission.id
                                      )}
                                      onChange={() =>
                                        togglePermission(
                                          permission.id
                                        )
                                      }
                                    />

                                    <span>
                                      <strong>
                                        {humanize(
                                          permission.action
                                        )}
                                      </strong>

                                      <small>
                                        {
                                          permission.module
                                        }
                                        :
                                        {
                                          permission.action
                                        }
                                      </small>
                                    </span>
                                  </label>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="panel-footer-actions">
                      <button
                        className="button primary"
                        type="button"
                        onClick={() =>
                          void saveRolePermissions()
                        }
                        disabled={
                          selectedPermissionIds.length ===
                          0
                        }
                      >
                        Save Permissions
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      );
    };

  const renderAudit =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Audit Logs"
            subtitle="Administrative changes and security-sensitive actions"
            onRefresh={
              loadAuditLogs
            }
            right={
              <div className="inline-filters audit-filters">
                <input
                  className="text-input compact"
                  value={
                    auditModuleFilter
                  }
                  onChange={(event) =>
                    setAuditModuleFilter(
                      event.target.value
                    )
                  }
                  placeholder="Module"
                />

                <input
                  className="text-input compact"
                  value={
                    auditEntityFilter
                  }
                  onChange={(event) =>
                    setAuditEntityFilter(
                      event.target.value
                    )
                  }
                  placeholder="Entity type"
                />

                <input
                  className="text-input compact"
                  value={
                    auditEntityIdFilter
                  }
                  onChange={(event) =>
                    setAuditEntityIdFilter(
                      event.target.value
                    )
                  }
                  placeholder="Entity ID"
                />

                <button
                  className="button primary"
                  type="button"
                  onClick={
                    loadAuditLogs
                  }
                >
                  Filter
                </button>
              </div>
            }
          />

          {auditLoading ? (
            <LoadingState message="Loading audit logs…" />
          ) : auditError ? (
            <ErrorState
              message={auditError}
              onRetry={loadAuditLogs}
            />
          ) : auditLogs.length === 0 ? (
            <EmptyState
              title="No audit logs"
              message="No audit entries match the selected filters."
            />
          ) : (
            <div className="panel">
              <div className="table-topbar">
                <PaginationInfo
                  count={
                    auditLogs.length
                  }
                />
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Admin</th>
                      <th>Role</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Entity</th>
                      <th>ID</th>
                      <th>Before / After</th>
                    </tr>
                  </thead>

                  <tbody>
                    {auditLogs.map(
                      (log) => (
                        <tr
                          key={
                            log.id
                          }
                        >
                          <td>
                            {formatDate(
                              log.createdAt
                            )}
                          </td>

                          <td>
                            {log.admin
                              ?.name ??
                              "—"}
                          </td>

                          <td>
                            {humanize(
                              log.admin
                                ?.role
                                ?.name
                            )}
                          </td>

                          <td>
                            <span className="tag emphasis">
                              {humanize(
                                log.action
                              )}
                            </span>
                          </td>

                          <td>
                            {humanize(
                              log.module
                            )}
                          </td>

                          <td>
                            {log.entityType ??
                              "—"}
                          </td>

                          <td>
                            {shortId(
                              log.entityId,
                              18
                            )}
                          </td>

                          <td>
                            <details className="audit-details">
                              <summary>
                                View data
                              </summary>

                              <div className="audit-data">
                                <div>
                                  <span>
                                    Before
                                  </span>
                                  <JsonBlock
                                    value={
                                      log.beforeData
                                    }
                                  />
                                </div>

                                <div>
                                  <span>
                                    After
                                  </span>
                                  <JsonBlock
                                    value={
                                      log.afterData
                                    }
                                  />
                                </div>
                              </div>
                            </details>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    };

  const renderQuickLocations =
    () => {
      return (
        <div className="page">
          <SectionHeader
            title="Quick Locations"
            subtitle="Admin-accessible quick location catalog"
            onRefresh={
              loadQuickLocations
            }
          />

          {quickLocationsLoading ? (
            <LoadingState message="Loading quick locations…" />
          ) : quickLocationsError ? (
            <ErrorState
              message={
                quickLocationsError
              }
              onRetry={
                loadQuickLocations
              }
            />
          ) : quickLocations.length ===
            0 ? (
            <EmptyState
              title="No quick locations"
              message="No quick location records were returned."
            />
          ) : (
            <div className="location-grid">
              {quickLocations.map(
                (location) => (
                  <div
                    className="location-card"
                    key={
                      location.id
                    }
                  >
                    <div className="location-card-header">
                      <div>
                        <p className="eyebrow">
                          {
                            location.category
                          }
                        </p>
                        <h3>
                          {location.name ??
                            "Unnamed location"}
                        </h3>
                      </div>

                      <Badge
                        value={
                          location.isActive
                            ? "ACTIVE"
                            : "INACTIVE"
                        }
                      />
                    </div>

                    <p>
                      {location.address ??
                        "No address"}
                    </p>

                    <div className="detail-grid compact-grid">
                      <div>
                        <span>
                          Latitude
                        </span>
                        <strong>
                          {displayValue(
                            location.latitude
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Longitude
                        </span>
                        <strong>
                          {displayValue(
                            location.longitude
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>ID</span>
                        <strong>
                          {shortId(
                            location.id
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      );
    };

  const renderKyc = () => {
    const documents = drivers.flatMap((driver) =>
      safeArray<NonNullable<Driver["documents"]>[number]>(
        driver.documents,
      )
        .filter((document) =>
          kycDocumentFilter
            ? String(document.status ?? "").toUpperCase() ===
              kycDocumentFilter
            : true,
        )
        .map((document) => ({
          ...document,
          driverId: driver.id,
          driverName: driver.fullName ?? driver.id,
        })),
    );

    return (
      <div className="page">
        <SectionHeader
          title="KYC / Documents"
          subtitle="Dedicated document review surface backed by Driver KYC data"
          onRefresh={() => void loadDrivers()}
          right={
            <select
              className="select-input"
              value={kycDocumentFilter}
              onChange={(event) =>
                setKycDocumentFilter(event.target.value)
              }
            >
              <option value="">All document statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          }
        />

        <div className="metrics-grid">
          <MetricCard
            label="Documents"
            value={formatNumber(documents.length)}
            icon="file"
            tone="neutral"
          />
          <MetricCard
            label="Pending"
            value={formatNumber(
              documents.filter(
                (document) =>
                  String(document.status ?? "").toUpperCase() ===
                  "PENDING",
              ).length,
            )}
            icon="clock"
            tone="warning"
          />
          <MetricCard
            label="Under Review"
            value={formatNumber(
              documents.filter(
                (document) =>
                  String(document.status ?? "").toUpperCase() ===
                  "UNDER_REVIEW",
              ).length,
            )}
            icon="activity"
            tone="info"
          />
          <MetricCard
            label="Approved"
            value={formatNumber(
              documents.filter(
                (document) =>
                  String(document.status ?? "").toUpperCase() ===
                  "APPROVED",
              ).length,
            )}
            icon="check"
            tone="success"
          />
        </div>

        <Panel
          title="Document Review Queue"
          subtitle={
            driversLoading
              ? "Refreshing driver/KYC data…"
              : `${documents.length} document(s)`
          }
        >
          {driversLoading ? (
            <LoadingState message="Loading KYC documents…" />
          ) : driversError ? (
            <ErrorState message={driversError} onRetry={loadDrivers} />
          ) : documents.length === 0 ? (
            <EmptyState
              title="No matching KYC documents"
              message="No driver documents match the current filter."
            />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Document</th>
                    <th>Number</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <button
                          className="table-link"
                          type="button"
                          onClick={() =>
                            void loadDriverDetails(String(document.driverId))
                          }
                        >
                          {document.driverName}
                        </button>
                      </td>
                      <td>{humanize(document.documentType ?? "DOCUMENT")}</td>
                      <td>{document.documentNumber ?? "—"}</td>
                      <td><StatusBadge value={document.status} /></td>
                      <td>{formatDate(document.updatedAt ?? document.createdAt)}</td>
                      <td>
                        <div className="row-actions">
                          {document.fileUrl ? (
                            <button
                              className="button secondary small"
                              type="button"
                              onClick={() =>
                                void (async () => {
                                  try {
                                    const response =
                                      await apiRequest<{ url: string }>(
                                        `/admin/drivers/${encodeURIComponent(
                                          String(document.driverId),
                                        )}/documents/${encodeURIComponent(
                                          document.id,
                                        )}/url`,
                                      );
                                    if (response.data?.url) {
                                      window.open(
                                        response.data.url,
                                        "_blank",
                                        "noopener,noreferrer",
                                      );
                                    }
                                  } catch (error) {
                                    showToast(
                                      "error",
                                      error instanceof Error
                                        ? error.message
                                        : String(error),
                                    );
                                  }
                                })()
                              }
                            >
                              View
                            </button>
                          ) : null}
                          <button
                            className="button secondary small"
                            type="button"
                            onClick={() =>
                              void apiRequest(
                                `/admin/drivers/${encodeURIComponent(
                                  String(document.driverId),
                                )}/documents/${encodeURIComponent(
                                  document.id,
                                )}/review`,
                                {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    status: "UNDER_REVIEW",
                                  }),
                                },
                              )
                                .then(() => loadDrivers())
                                .then(() =>
                                  showToast(
                                    "success",
                                    "Document marked under review.",
                                  ),
                                )
                                .catch((error) =>
                                  showToast(
                                    "error",
                                    error instanceof Error
                                      ? error.message
                                      : String(error),
                                  ),
                                )
                            }
                          >
                            Review
                          </button>
                          <button
                            className="button primary small"
                            type="button"
                            onClick={() =>
                              void apiRequest(
                                `/admin/drivers/${encodeURIComponent(
                                  String(document.driverId),
                                )}/documents/${encodeURIComponent(
                                  document.id,
                                )}/review`,
                                {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    status: "APPROVED",
                                  }),
                                },
                              )
                                .then(() => loadDrivers())
                                .then(() =>
                                  showToast(
                                    "success",
                                    "Document approved.",
                                  ),
                                )
                                .catch((error) =>
                                  showToast(
                                    "error",
                                    error instanceof Error
                                      ? error.message
                                      : String(error),
                                  ),
                                )
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="button danger-button small"
                            type="button"
                            onClick={() => {
                              const reason = window.prompt(
                                "Rejection reason",
                              );
                              if (!reason?.trim()) return;

                              void apiRequest(
                                `/admin/drivers/${encodeURIComponent(
                                  String(document.driverId),
                                )}/documents/${encodeURIComponent(
                                  document.id,
                                )}/review`,
                                {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    status: "REJECTED",
                                    rejectionReason: reason.trim(),
                                  }),
                                },
                              )
                                .then(() => loadDrivers())
                                .then(() =>
                                  showToast(
                                    "success",
                                    "Document rejected.",
                                  ),
                                )
                                .catch((error) =>
                                  showToast(
                                    "error",
                                    error instanceof Error
                                      ? error.message
                                      : String(error),
                                  ),
                                );
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    );
  };

  const renderSharedRoutes = () => (
    <div className="page">
      <SectionHeader
        title="Shared Ride Routes"
        subtitle="Admin route catalog and controlled route configuration"
        onRefresh={() => void loadSharedRoutes()}
      />

      <div className="metrics-grid">
        <MetricCard
          label="Routes"
          value={formatNumber(sharedRoutes.length)}
          icon="route"
          tone="neutral"
        />
        <MetricCard
          label="Active"
          value={formatNumber(
            sharedRoutes.filter((route) => route.active).length,
          )}
          icon="check"
          tone="success"
        />
        <MetricCard
          label="Route Points"
          value={formatNumber(
            sharedRoutes.reduce(
              (sum, route) => sum + safeArray(route.points).length,
              0,
            ),
          )}
          icon="map"
          tone="info"
        />
      </div>

      {sharedRoutesLoading ? (
        <LoadingState message="Loading Shared Ride routes…" />
      ) : sharedRoutesError ? (
        <ErrorState
          message={sharedRoutesError}
          onRetry={loadSharedRoutes}
        />
      ) : sharedRoutes.length === 0 ? (
        <EmptyState
          title="No Shared Ride routes"
          message="The backend returned no Shared Ride route records."
        />
      ) : (
        <Panel
          title="Route Catalog"
          subtitle="Backend-authoritative Shared Ride route records"
        >
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>City</th>
                  <th>Selection</th>
                  <th>Points</th>
                  <th>City Zone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sharedRoutes.map((route) => (
                  <tr key={route.id}>
                    <td>
                      <strong>{route.name ?? route.id}</strong>
                      <span className="cell-sub">
                        {shortId(route.id, 18)}
                      </span>
                    </td>
                    <td>{route.city ?? "—"}</td>
                    <td>{humanize(route.selectionMode ?? "AUTO_NEAREST")}</td>
                    <td>{formatNumber(safeArray(route.points).length)}</td>
                    <td>
                      {route.cityZone?.name ??
                        route.cityZone?.id ??
                        route.cityZoneId ??
                        "—"}
                    </td>
                    <td>
                      <StatusBadge
                        value={route.active ? "ACTIVE" : "INACTIVE"}
                      />
                    </td>
                    <td>
                      <button
                        className="button secondary small"
                        type="button"
                        onClick={() => openSharedRoute(route)}
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {selectedSharedRoute ? (
        <Panel
          title={`Configure: ${selectedSharedRoute.name ?? selectedSharedRoute.id}`}
          subtitle="PATCH uses the current backend Shared Ride route contract and remains permission/audit controlled."
          className="route-editor-panel"
        >
          <div className="detail-grid">
            <label>
              <span className="field-label">Route name</span>
              <input
                className="text-input"
                value={sharedRouteDraft.name}
                onChange={(event) =>
                  setSharedRouteDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span className="field-label">City</span>
              <input
                className="text-input"
                value={sharedRouteDraft.city}
                onChange={(event) =>
                  setSharedRouteDraft((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span className="field-label">City zone ID</span>
              <input
                className="text-input"
                value={sharedRouteDraft.cityZoneId}
                onChange={(event) =>
                  setSharedRouteDraft((current) => ({
                    ...current,
                    cityZoneId: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span className="field-label">Selection mode</span>
              <select
                className="select-input"
                value={sharedRouteDraft.selectionMode}
                onChange={(event) =>
                  setSharedRouteDraft((current) => ({
                    ...current,
                    selectionMode: event.target.value,
                  }))
                }
              >
                <option value="AUTO_NEAREST">Auto nearest</option>
                <option value="EXACT_POINT">Exact point</option>
              </select>
            </label>
            <label>
              <span className="field-label">Status</span>
              <select
                className="select-input"
                value={sharedRouteDraft.active ? "ACTIVE" : "INACTIVE"}
                onChange={(event) =>
                  setSharedRouteDraft((current) => ({
                    ...current,
                    active: event.target.value === "ACTIVE",
                  }))
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>

          <div className="button-row" style={{ marginTop: 14 }}>
            <button
              className="button primary"
              type="button"
              onClick={() => void saveSharedRoute()}
              disabled={sharedRouteSaving}
            >
              {sharedRouteSaving ? "Saving…" : "Save Route Configuration"}
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setSelectedSharedRoute(null)}
              disabled={sharedRouteSaving}
            >
              Close
            </button>
          </div>

          <div className="route-points-list">
            <div className="panel-header">
              <div>
                <h3>Route Points</h3>
                <p>
                  Read-only catalog here; point creation/update remains
                  backend-contract controlled.
                </p>
              </div>
            </div>
            {safeArray<SharedRoutePoint>(selectedSharedRoute.points).length ===
            0 ? (
              <EmptyState
                title="No route points"
                message="No Shared Ride points are attached to this route."
              />
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Seq</th>
                      <th>Point</th>
                      <th>Address</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeArray<SharedRoutePoint>(
                      selectedSharedRoute.points,
                    )
                      .slice()
                      .sort(
                        (a, b) =>
                          Number(a.sequence ?? 0) -
                          Number(b.sequence ?? 0),
                      )
                      .map((point) => (
                        <tr key={point.id}>
                          <td>{point.sequence ?? "—"}</td>
                          <td>{point.name ?? "—"}</td>
                          <td>{point.address ?? "—"}</td>
                          <td>{displayValue(point.latitude)}</td>
                          <td>{displayValue(point.longitude)}</td>
                          <td>
                            <StatusBadge
                              value={point.active ? "ACTIVE" : "INACTIVE"}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Panel>
      ) : null}
    </div>
  );

  const renderSetup = () => {
    return (
      <div className="page">
        <SectionHeader
          title="Test Data Lab"
          subtitle="RideX TEST dataset — seed, inspect and operate against the backend TEST environment"
          onRefresh={() => void loadTestData()}
        />

        {!RIDEX_TEST_MODE ? (
          <div className="panel warning-panel"><strong>TEST MODE DISABLED</strong><p>Set RIDEX_TEST_MODE=true in the backend environment to use the test dataset.</p></div>
        ) : (
          <>
            <div className="content-grid two">
              <div className="panel setup-panel">
                <p className="eyebrow">CONTROLLED FIXTURE</p>
                <h2>RideX TEST dataset</h2>
                <p>Creates the deterministic RideX TEST fixture set for customers, drivers, vehicles, bookings, trips, payments, earnings, support, SOS, notifications, coupons, configuration and RBAC. The current direct seed summary uses the v5.6 blueprint fixture set.</p>
                <div className="button-row">
                  <button className="button primary large" type="button" onClick={() => void seedAllTestData()} disabled={testDataLoading}>{testDataLoading ? "Working…" : "Seed / Reset All Test Data"}</button>
                  <button className="button danger-button large" type="button" onClick={() => void deleteAllTestData()} disabled={testDataLoading}>Delete All Test Data</button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header"><div><p className="eyebrow">DATASET</p><h3>Fixture summary</h3></div></div>
                <div className="metric-grid">
                  {Object.entries(testDataSummary ?? {}).map(([key, value]) => <MetricCard key={key} label={humanize(key)} value={formatNumber(value)} icon="database" />)}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header"><div><p className="eyebrow">ADMIN CRUD</p><h3>Editable test records</h3></div></div>
              <p>Normal operational edits should use the dedicated Customer, Driver, Vehicle, Rides, Promotions and Support screens. The current Admin test-data CRUD endpoint still enforces its legacy v3.5 confirmation/ID gate; current v5.6 blueprint fixture IDs are therefore treated as read-only here until that backend gate is migrated.</p>
              <div className="table-wrapper">
                <table><thead><tr><th>Entity</th><th>Records</th><th>Examples</th><th>Controls</th></tr></thead><tbody>
                  {testDataRecords ? Object.entries(testDataRecords).map(([key, rows]) => { const records = rows as any[]; const target = records[0]; return <tr key={key}><td>{humanize(key)}</td><td>{records.length}</td><td>{records.slice(0, 3).map((r) => shortId(r.id ?? "", 18)).join(", ") || "—"}</td><td><span className="badge">Read-only until TEST CRUD gate is migrated</span></td></tr>; }) : <tr><td colSpan={4}>Load the test dataset to inspect records.</td></tr>}
                </tbody></table>
              </div>
            </div>

            <div className="panel warning-panel"><strong>TEST-only safety boundary</strong><p>Seed/reset remains disabled outside TEST. The current backend seed path reports the v5.6 blueprint fixture set, while the Admin CRUD endpoint retains a legacy v3.5 ID confirmation boundary.</p></div>
          </>
        )}
      </div>
    );
  };

  const renderLiveOperations = () => {
    const activeStatuses = new Set(["MATCHING", "DRIVER_ASSIGNED", "DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS"]);
    const activeBookings = bookings.filter((booking) => activeStatuses.has(String(booking.status ?? "").toUpperCase()));
    const waitingBookings = bookings.filter((booking) => String(booking.status ?? "").toUpperCase() === "MATCHING");
    const cancelledBookings = bookings.filter((booking) => String(booking.status ?? "").toUpperCase() === "CANCELLED");
    const onlineDrivers = drivers.filter((driver) => ["ONLINE", "ON_TRIP"].includes(String(driver.driverStatus ?? "").toUpperCase()));
    const activeRides = activeBookings.slice(0, 8);
    const etaValues = activeBookings
      .map((booking) => {
        const directEta =
          Number(
            (booking as unknown as { etaMinutes?: unknown }).etaMinutes,
          );
        if (Number.isFinite(directEta) && directEta >= 0) {
          return directEta;
        }

        const legEta = safeArray<BookingLeg>(booking.legs)
          .map((leg) => Number(leg.durationMinutes))
          .find((value) => Number.isFinite(value) && value >= 0);

        return legEta;
      })
      .filter(
        (value): value is number =>
          value !== undefined &&
          Number.isFinite(value) && value >= 0,
      );
    const averageEta =
      etaValues.length > 0
        ? `${(
            etaValues.reduce((sum, value) => sum + value, 0) /
            etaValues.length
          ).toFixed(0)} min`
        : "—";

    return (
      <div className="page">
        <SectionHeader
          title="Live Rides / Live Operations"
          subtitle="Backend-authoritative driver, ride, request, GPS and safety operations"
          actions={
            <>
              <span
                className={`realtime-pill ${realtimeStatus}`}
                title={
                  realtimeLastEvent
                    ? `${realtimeLastEvent.type} · ${formatDate(
                        realtimeLastEvent.receivedAt,
                      )}`
                    : "No realtime event received yet"
                }
              >
                <span className="online-dot" />
                {realtimeStatus === "connected"
                  ? "Realtime Connected"
                  : realtimeStatus === "connecting"
                    ? "Realtime Connecting"
                    : realtimeStatus === "reconnecting"
                      ? "Realtime Reconnecting"
                      : "Realtime Offline"}
              </span>
              <span className="api-pill">
                <span className="online-dot" />
                {browserOnline ? "API Online" : "Browser Offline"}
              </span>
            </>
          }
        />

        {!browserOnline ? (
          <div className="notice warning-notice">
            <strong>Offline mode</strong>
            <span>
              The browser reports no network connectivity. Read-only state
              remains visible; write actions are blocked by the API layer.
            </span>
          </div>
        ) : null}

        <div className="metrics-grid">
          <MetricCard
            label="Active Rides"
            value={formatNumber(activeBookings.length)}
            icon="driver"
            tone="success"
          />
          <MetricCard
            label="Online Drivers"
            value={formatNumber(onlineDrivers.length)}
            icon="driver"
            tone="info"
          />
          <MetricCard
            label="Total Drivers"
            value={formatNumber(drivers.length)}
            icon="users"
            tone="neutral"
          />
          <MetricCard
            label="Waiting for Driver"
            value={formatNumber(waitingBookings.length)}
            icon="clock"
            tone="warning"
          />
          <MetricCard
            label="Backend ETA"
            value={averageEta}
            icon="clock"
            tone="info"
          />
          <MetricCard
            label="Cancelled"
            value={formatNumber(cancelledBookings.length)}
            icon="close"
            tone="danger"
          />
        </div>

        {realtimeLastEvent ? (
          <div className="info-box live-event-box">
            <strong>Last realtime event</strong>
            <span>
              {humanize(realtimeLastEvent.type)} ·{" "}
              {formatDate(realtimeLastEvent.receivedAt)}
            </span>
          </div>
        ) : null}

        <div className="content-grid two">
          <Panel
            title="Active Rides"
            subtitle={`${activeBookings.length} active booking(s) from backend`}
          >
            <div className="stack-list">
              {activeRides.length === 0 ? (
                <div className="muted">No active rides right now.</div>
              ) : (
                activeRides.map((booking) => (
                  <button
                    className="list-row live-ride-row"
                    key={booking.id}
                    type="button"
                    onClick={() => void loadBookingDetails(booking.id)}
                  >
                    <div>
                      <strong>
                        {booking.assignedDriver?.fullName ?? "Unassigned"}
                      </strong>
                      <span>
                        {shortId(booking.id, 18)} •{" "}
                        {booking.pickupAddress ?? "Pickup"} →{" "}
                        {booking.dropAddress ?? "Drop"}
                      </span>
                    </div>
                    <div className="row-right">
                      <StatusBadge
                        value={humanize(booking.status ?? "UNKNOWN")}
                      />
                      <span>
                        {booking.vehicle?.vehicleNumber ?? "No vehicle"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Panel>

          <Panel
            title="Operations Map"
            subtitle="Coordinate-based operational map using backend GPS data"
          >
            <LiveOperationsMap
              drivers={drivers}
              bookings={bookings}
              onDriverClick={(driverId) =>
                void loadDriverDetails(driverId)
              }
            />
          </Panel>
        </div>
      </div>
    );
  };

  const renderQuickRide = () => (
    <div className="page">
      <SectionHeader title="Quick Ride Create" subtitle="Admin-created/manual booking for operations and support" />
      <div className="content-grid two">
        <Panel title="Ride Details" subtitle="Backend-authoritative manual booking">
          <div className="detail-grid">
            <label><span className="field-label">Customer ID</span><input className="text-input" placeholder="Customer ID" /></label>
            <label><span className="field-label">Service Type</span><select className="select-input" defaultValue="PASSENGER"><option>PASSENGER</option><option>PARCEL</option><option>GOODS</option></select></label>
            <label><span className="field-label">Pickup</span><input className="text-input" placeholder="Pickup location" /></label>
            <label><span className="field-label">Drop</span><input className="text-input" placeholder="Drop location" /></label>
            <label><span className="field-label">Ride Type</span><select className="select-input" defaultValue="FULL_RIDE"><option>FULL_RIDE</option><option>SHARED_RIDE</option><option>CONNECTION_RIDE</option></select></label>
            <label><span className="field-label">Payment Method</span><select className="select-input" defaultValue="CASH"><option>CASH</option><option>UPI</option><option>WALLET</option></select></label>
          </div>
          <button className="button secondary" type="button" disabled><AppIcon name="plus" size={15} /> Create Ride — backend booking endpoint required</button>
          <div className="info-box"><strong>No fake booking</strong><p>This Admin screen does not fabricate a booking or fare. Final creation must call the supplied backend booking/command endpoint so validation, pricing, payment and audit rules remain backend-authoritative.</p></div>
        </Panel>
        <Panel title="Driver / Vehicle" subtitle="Optional assignment; matching remains backend-controlled">
          <div className="detail-grid">
            <label><span className="field-label">Driver</span><select className="select-input" defaultValue="auto"><option value="auto">Auto Match</option></select></label>
            <label><span className="field-label">Vehicle</span><select className="select-input" defaultValue="auto"><option value="auto">Auto Select</option><option>E_RICKSHAW</option><option>PICKUP_TRUCK</option></select></label>
          </div>
          <div className="info-box"><strong>Compatibility rule</strong><p>Passenger → E-Rickshaw only. Parcel → Passenger E-Rickshaw only. Goods → Battery Pickup Truck only.</p></div>
        </Panel>
      </div>
    </div>
  );

  const loadPricingRules = useCallback(async () => {
    try { const r = await apiRequest<any[]>("/admin/platform/pricing-rules"); setPricingRules(Array.isArray(r.data)?r.data:[]); } catch(e) { showToast("error", e instanceof Error ? e.message : "Unable to load pricing rules"); }
  }, [apiRequest, showToast]);

  const savePricingRule = useCallback(async () => {
    if (!pricingDraft.name.trim()) return showToast("error","Rule name is required");
    try { await apiRequest("/admin/platform/pricing-rules",{method:"POST",body:JSON.stringify({...pricingDraft,baseFare:Number(pricingDraft.baseFare),perKm:Number(pricingDraft.perKm),perMinute:Number(pricingDraft.perMinute),minFare:Number(pricingDraft.minFare),maxFare:Number(pricingDraft.maxFare),multiplier:Number(pricingDraft.multiplier),priority:Number(pricingDraft.priority),active:true})}); setPricingDraft({...pricingDraft,name:""}); await loadPricingRules(); showToast("success","Pricing rule created"); } catch(e) { showToast("error",e instanceof Error?e.message:"Unable to save pricing rule"); }
  }, [apiRequest, loadPricingRules, pricingDraft, showToast]);

  const updatePricingRule = useCallback(async (rule: any) => {
    const baseFare = window.prompt("Base fare", String(rule.baseFare ?? 0));
    if (baseFare === null) return;
    const perKm = window.prompt("Per km", String(rule.perKm ?? 0));
    if (perKm === null) return;
    const perMinute = window.prompt("Per minute", String(rule.perMinute ?? 0));
    if (perMinute === null) return;
    const minFare = window.prompt("Minimum fare", String(rule.minFare ?? 0));
    if (minFare === null) return;
    const maxFare = window.prompt("Maximum fare", String(rule.maxFare ?? 0));
    if (maxFare === null) return;
    try { await apiRequest(`/admin/platform/pricing-rules/${rule.id}`, {method:"PATCH", body:JSON.stringify({baseFare:Number(baseFare),perKm:Number(perKm),perMinute:Number(perMinute),minFare:Number(minFare),maxFare:Number(maxFare)})}); await loadPricingRules(); showToast("success","Pricing rule updated"); } catch(e) { showToast("error",e instanceof Error?e.message:"Unable to update pricing rule"); }
  }, [apiRequest, loadPricingRules, showToast]);

  const renderPricing = () => {
    const activeRules = pricingRules.filter((rule: any) => rule.active !== false);
    const passengerRules = activeRules.filter((rule: any) => String(rule.serviceType ?? "").toUpperCase() === "PASSENGER");
    const goodsRules = activeRules.filter((rule: any) => String(rule.serviceType ?? "").toUpperCase() === "GOODS");
    return (
      <div className="page">
        <SectionHeader title="Pricing & Commission" subtitle="RideX master fare rules and operational configuration">
        </SectionHeader>
        <div className="metrics-grid">
          <MetricCard label="Active Rules" value={formatNumber(activeRules.length)} icon="database" tone="success" />
          <MetricCard label="Passenger Rules" value={formatNumber(passengerRules.length)} icon="driver" tone="info" />
          <MetricCard label="Goods Rules" value={formatNumber(goodsRules.length)} icon="vehicle" tone="warning" />
          <MetricCard label="All Rules" value={formatNumber(pricingRules.length)} icon="percent" tone="neutral" />
        </div>
        <Panel title="Create / Manage Smart Pricing Rule" subtitle="Super Admin: rules stay within configured minimum/maximum boundaries">
          <div className="detail-grid">
            {Object.entries(pricingDraft).map(([key,val]) => <label key={key}><span className="field-label">{key}</span><input className="text-input" value={String(val)} onChange={e=>setPricingDraft(d=>({...d,[key]:e.target.value}))} /></label>)}
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}><button className="button primary" onClick={()=>void savePricingRule()}>Create Rule</button><button className="button secondary" onClick={()=>void loadPricingRules()}>Refresh Rules</button></div>
        </Panel>
        <Panel title="Configured Pricing Rules" subtitle={`${pricingRules.length} rule(s) loaded from backend`}>
          <div className="table-wrapper"><table><thead><tr><th>Name</th><th>Service</th><th>Vehicle</th><th>Base</th><th>Per Km</th><th>Per Minute</th><th>Min/Max</th><th>Multiplier</th><th>Priority</th><th>Action</th></tr></thead><tbody>{pricingRules.map((r:any)=><tr key={r.id}><td>{r.name}</td><td>{r.serviceType||r.bookingType||"ALL"}</td><td>{r.vehicleType||"ALL"}</td><td>₹{r.baseFare??0}</td><td>₹{r.perKm??0}</td><td>₹{r.perMinute??0}</td><td>₹{r.minFare??0} / ₹{r.maxFare??0}</td><td>{r.multiplier}x</td><td>{r.priority}</td><td><button className="button secondary small" onClick={()=>void updatePricingRule(r)}>Edit</button></td></tr>)}</tbody></table></div>
        </Panel>
      </div>
    );
  };

  const renderPayments = () => (
    <div className="page">
      <SectionHeader title="Payments & Settlement" subtitle="Live payment records from the RideX backend" onRefresh={() => void loadOperationsData()} />
      <Panel title="Payments" subtitle={operationLoading ? "Refreshing…" : `${paymentRows.length} records`}>
        <div className="table-wrapper"><table><thead><tr><th>Payment</th><th>Booking</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead><tbody>{paymentRows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.bookingId}</td><td>{row.customer?.user?.mobile || row.customerId}</td><td>{row.method}</td><td>₹{Number(row.amount || 0).toFixed(2)}</td><td><StatusBadge value={row.status}/></td><td>{formatDate(row.createdAt)}</td></tr>)}{paymentRows.length===0?<tr><td colSpan={7}>No payments found.</td></tr>:null}</tbody></table></div>
      </Panel>
    </div>
  );

  const renderPromotions = () => (
    <div className="page">
      <SectionHeader title="Promotions" subtitle="Live coupons and campaign controls" onRefresh={() => void loadOperationsData()} actions={<button className="button primary" type="button" onClick={() => void createPromotion()}><Plus size={15}/> Create Promotion</button>} />
      <div className="content-grid two">{promotionRows.map((row) => <Panel key={row.id} title={row.code} subtitle={row.description || "Promotion"}><StatusBadge value={row.isActive ? "Active" : "Inactive"}/><div className="detail-grid"><div><span className="field-label">Discount</span><strong>{row.discountType === "PERCENTAGE" ? `${row.discountValue}%` : `₹${row.discountValue}`}</strong></div><div><span className="field-label">Usage</span><strong>{row.usageCount ?? 0}</strong></div></div><button className="button secondary small" type="button" onClick={() => void apiRequest(`/admin/promotions/${row.id}`, {method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({isActive:!row.isActive})}).then(()=>loadOperationsData())}> {row.isActive ? "Deactivate" : "Activate"}</button></Panel>)}{promotionRows.length===0?<Panel title="No promotions"><p>No live promotions found.</p></Panel>:null}</div>
    </div>
  );

  const renderSupport = () => (
    <div className="page">
      <SectionHeader
        title="Support & Disputes"
        subtitle="RBAC-protected support inbox with case conversation and Admin replies"
        onRefresh={() => void loadOperationsData()}
      />
      <div className="metrics-grid">
        <MetricCard
          label="Open / Active"
          value={formatNumber(
            supportRows.filter((row) =>
              ["OPEN", "IN_PROGRESS"].includes(
                String(row.status ?? "").toUpperCase(),
              ),
            ).length,
          )}
          icon="support"
          tone="warning"
        />
        <MetricCard
          label="Resolved"
          value={formatNumber(
            supportRows.filter(
              (row) =>
                String(row.status ?? "").toUpperCase() === "RESOLVED",
            ).length,
          )}
          icon="check"
          tone="success"
        />
        <MetricCard
          label="Total Cases"
          value={formatNumber(supportRows.length)}
          icon="database"
          tone="neutral"
        />
      </div>

      <Panel title="Support Inbox">
        {operationLoading ? (
          <LoadingState message="Loading support cases…" />
        ) : supportRows.length === 0 ? (
          <EmptyState
            title="No support cases"
            message="No support cases were returned by the Admin support API."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Requester</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {supportRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{shortId(row.id, 20)}</strong>
                      <span className="cell-sub">
                        {row.subject || "RideX support case"}
                      </span>
                    </td>
                    <td>
                      {row.customer?.fullName ||
                        row.driver?.fullName ||
                        "Unknown"}
                    </td>
                    <td>
                      <StatusBadge value={row.priority} />
                    </td>
                    <td>
                      <StatusBadge value={row.status} />
                    </td>
                    <td>{formatDate(row.updatedAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="button secondary small"
                          type="button"
                          onClick={() => void openSupportCase(String(row.id))}
                        >
                          View / Reply
                        </button>
                        <button
                          className={
                            row.status === "RESOLVED"
                              ? "button secondary small"
                              : "button primary small"
                          }
                          type="button"
                          onClick={() =>
                            void apiRequest(
                              `/support/admin/cases/${encodeURIComponent(
                                String(row.id),
                              )}`,
                              {
                                method: "PATCH",
                                body: JSON.stringify({
                                  status:
                                    String(row.status).toUpperCase() ===
                                    "RESOLVED"
                                      ? "OPEN"
                                      : "RESOLVED",
                                }),
                              },
                            )
                              .then(() => loadOperationsData())
                              .catch((error) =>
                                showToast(
                                  "error",
                                  error instanceof Error
                                    ? error.message
                                    : String(error),
                                ),
                              )
                          }
                        >
                          {row.status === "RESOLVED" ? "Reopen" : "Resolve"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );

  const renderNotifications = () => (
    <div className="page">
      <SectionHeader title="Notifications" subtitle="Send in-app operational messages to active customers and drivers" />
      <Panel title="Broadcast Notification">
        <div className="detail-grid"><label><span className="field-label">Audience</span><select className="select-input" value={notificationAudience} onChange={(e)=>setNotificationAudience(e.target.value)}><option value="ALL">All active users</option><option value="CUSTOMERS">Customers</option><option value="DRIVERS">Drivers</option></select></label><label><span className="field-label">Title</span><input className="text-input" value={notificationTitle} onChange={(e)=>setNotificationTitle(e.target.value)} placeholder="Notification title" /></label><label style={{gridColumn:'1 / -1'}}><span className="field-label">Message</span><textarea className="text-input" rows={5} value={notificationBody} onChange={(e)=>setNotificationBody(e.target.value)} placeholder="Write your message..." /></label></div>
        <button className="button primary" type="button" onClick={() => void sendBroadcast()}>Send Notification</button>
      </Panel>
    </div>
  );

  const renderSettings =
    () => {
      const groups = [
        { title: "OTP / SMS", keys: ["OTP_PROVIDER_URL", "OTP_PROVIDER_API_KEY", "OTP_PROVIDER_USERNAME", "OTP_PROVIDER_PASSWORD", "OTP_PROVIDER_SENDER_ID"] },
        { title: "Routing / Maps", keys: ["ROUTING_URL", "GOOGLE_MAPS_API_KEY"] },
        { title: "Payments", keys: ["PAYMENT_PROVIDER_URL", "PAYMENT_PROVIDER_API_KEY", "PAYMENT_PROVIDER_USERNAME", "PAYMENT_PROVIDER_PASSWORD"] },
      ];
      return (
        <div className="page">
          <SectionHeader title="System Settings / Integrations" subtitle="Configure online providers without editing application source code" />
          <div className="info-box"><strong>Security</strong><p>Provider secrets are encrypted before database storage. Google Maps mobile keys still need to be supplied at Expo/EAS build time; an already-built mobile app cannot safely replace its native map key at runtime.</p></div>
          <div className="content-grid two">
            {groups.map((group) => (
              <Panel key={group.title} title={group.title} subtitle="Super Admin only">
                {group.keys.map((key) => (
                  <div key={key} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
                      <span className="field-label">{key}</span>
                      <span className={`status ${integrationStatus[key]?.configured ? "success" : "warning"}`}>{integrationStatus[key]?.configured ? "Configured" : "Not configured"}</span>
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:6}}>
                      <input className="text-input" type={key.includes("PASSWORD") || key.includes("API_KEY") ? "password" : "text"} value={integrationValues[key] ?? ""} onChange={(event) => setIntegrationValues((current) => ({...current, [key]: event.target.value}))} placeholder={integrationStatus[key]?.configured ? "Enter new value to replace" : "Enter value"} />
                      <button className="button primary" type="button" onClick={() => void saveIntegrationValue(key)}>Save</button>
                    </div>
                  </div>
                ))}
              </Panel>
            ))}
          </div>
          <button className="button secondary" type="button" onClick={() => void loadIntegrationStatus()} disabled={integrationLoading}>{integrationLoading ? "Refreshing…" : "Refresh integration status"}</button>
        </div>
      );
    };

  const renderCurrentScreen =
    () => {
      switch (currentScreen) {
        case "liveOperations":
          return renderLiveOperations();
        case "quickRide":
          return renderQuickRide();
        case "payments":
          return renderPayments();
        case "reports":
          return renderReports();
        case "pricing":
          return renderPricing();
        case "vehicles":
          return renderVehicles();
        case "promotions":
          return renderPromotions();
        case "support":
          return renderSupport();
        case "notifications":
          return renderNotifications();
        case "settings":
          return renderSettings();
        case "matching":
          return <MatchingPanel bookings={bookings as Array<Record<string, any>>} drivers={drivers as Array<Record<string, any>>} apiRequest={apiRequest as BlueprintApiRequest} notify={showToast} />;
        case "events":
          return <EventsPanel apiRequest={apiRequest as BlueprintApiRequest} notify={showToast} />;
        case "finance":
          return <FinancePanel apiRequest={apiRequest as BlueprintApiRequest} notify={showToast} />;
        case "security":
          return <SecurityPanel apiRequest={apiRequest as BlueprintApiRequest} notify={showToast} />;
        case "monitoring":
          return <MonitoringPanel apiRequest={apiRequest as BlueprintApiRequest} notify={showToast} />;
        case "dashboard":
          return renderDashboard();

        case "drivers":
          return renderDrivers();

        case "kyc":
          return renderKyc();

        case "routes":
          return renderSharedRoutes();

        case "bookings":
          return renderBookings();

        case "customers":
          return renderCustomers();

        case "safety":
          return renderSafety();

        case "admins":
          return renderAdmins();

        case "roles":
          return renderRoles();

        case "audit":
          return renderAudit();

        case "quickLocations":
          return renderQuickLocations();

        case "setup":
          return renderSetup();
        case "platform":
          return renderPlatform();

        default:
          return renderDashboard();
      }
    };

  if (!connected) {
    return (
      <>
        <style>{RIDEX_ADMIN_THEME}</style>
        <div className="login-shell">
          <div className="login-card">
            <div className="brand-block">
              <div className="brand-mark">
                R
              </div>

              <div>
                <h1>
                  RideX Admin
                </h1>
                <p>
                  Operations Control Panel
                </p>
              </div>
            </div>

            <div className="login-heading">
              <p className="eyebrow">
                {RIDEX_TEST_MODE ? "TEST ADMIN ACCESS" : "PRODUCTION ADMIN ACCESS"}
              </p>

              <h2>
                Connect to RideX
              </h2>

              <p>
                Verify the approved Admin mobile with OTP to establish a backend-issued secure session.
              </p>

              {RIDEX_TEST_MODE || testOtp ? (
                <div
                  style={{
                    marginTop: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#fff7ed",
                    color: "#9a3412",
                    border: "1px solid #fed7aa",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  TEST MODE ONLY · Backend-generated OTP
                </div>
              ) : null}
            </div>

            <form
              className="login-form"
              onSubmit={(event) => {
                event.preventDefault();
                void verifyAdminOtp();
              }}
            >
              <label>
                <span className="field-label">
                  Backend API Base URL
                </span>

                <input
                  className="text-input"
                  value={apiBaseUrl}
                  onChange={(event) =>
                    setApiBaseUrl(
                      event.target
                        .value
                    )
                  }
                  placeholder="http://localhost:4000/api/v1"
                />
              </label>

              <label><span className="field-label">Admin Mobile</span><input className="text-input" value={adminMobile} onChange={(event) => { setAdminMobile(event.target.value.replace(/\D/g, "").slice(0, 10)); setTestOtp(""); }} inputMode="numeric" placeholder="10-digit admin mobile" autoFocus /></label>
              <label><span className="field-label">OTP</span><input className="text-input" value={adminOtp} onChange={(event) => setAdminOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="4-digit OTP" /></label>

              {testOtp ? (
                <div
                  style={{
                    marginTop: 2,
                    padding: 16,
                    border: "2px solid #d97706",
                    borderRadius: 12,
                    background: "#fff7ed",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#9a3412",
                      marginBottom: 6,
                    }}
                  >
                    TEST MODE ONLY
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: "#7c2d12",
                      marginBottom: 10,
                    }}
                  >
                    This OTP is visible only in the RideX TEST environment.
                    It is never displayed in Production.
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        lineHeight: 1,
                        fontWeight: 900,
                        letterSpacing: "0.22em",
                        fontFamily: "monospace",
                        color: "#111827",
                        padding: "8px 12px",
                        background: "#ffffff",
                        border: "1px solid #fed7aa",
                        borderRadius: 10,
                      }}
                      aria-label={`TEST OTP ${testOtp}`}
                    >
                      {testOtp}
                    </div>

                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          void navigator.clipboard.writeText(testOtp);
                        }
                        setAdminOtp(testOtp);
                        showToast("success", "TEST OTP copied to OTP field.");
                      }}
                    >
                      Use OTP
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 9,
                      fontSize: 11,
                      color: "#92400e",
                    }}
                  >
                    Purpose: {ADMIN_LOGIN_PURPOSE} · Expires according to backend OTP configuration.
                  </div>
                </div>
              ) : null}

              <div style={{display:"flex",gap:10}}>
                <button className="button secondary large" type="button" onClick={() => void sendAdminOtp()} disabled={adminAuthLoading}>Send OTP</button>
                <button className="button primary large" type="button" onClick={() => void verifyAdminOtp()} disabled={adminAuthLoading}>Verify & Connect</button>
              </div>
            </form>

            <div className="login-note">
              <strong>Session authentication</strong>
              <span>Backend-issued bearer session authentication is required. No Admin User ID header or frontend mock session is used.</span>
            </div>
          </div>
        </div>

        {toast ? (
          <div
            className={`toast ${toast.type}`}
          >
            {toast.message}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <style>{RIDEX_ADMIN_THEME}</style>
      <div
      className={`admin-shell ${
        compactSidebar
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      <aside
        className={`sidebar ${
          mobileNavOpen
            ? "mobile-open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <img
            className="sidebar-brand-logo"
            src="/assets/ridex-admin-logo.png"
            alt="RideX Admin"
          />

          {!compactSidebar ? (
            <div>
              <strong>
                RideX
              </strong>
              <span>
                Admin Control
              </span>
            </div>
          ) : null}
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map(
            (item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  currentScreen ===
                  item.id
                    ? "active"
                    : ""
                }`}
                type="button"
                onClick={() =>
                  navigate(
                    item.id
                  )
                }
                title={
                  compactSidebar
                    ? item.label
                    : undefined
                }
              >
                <span className="nav-icon">
                  <AppIcon name={item.icon} size={17} />
                </span>

                {!compactSidebar ? (
                  <span>
                    {item.label}
                  </span>
                ) : null}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          {!compactSidebar ? (
            <div className="admin-mini">
              <span className="online-dot" />
              <div>
                <strong>
                  {realtimeStatus === "connected"
                    ? "Realtime Connected"
                    : browserOnline
                      ? "API Connected"
                      : "Offline"}
                </strong>
                <span>
                  {shortId(
                    adminUserId,
                    22
                  )}
                </span>
              </div>
            </div>
          ) : null}

          <button
            className="nav-item"
            type="button"
            onClick={
              handleDisconnect
            }
            title="Disconnect"
          >
            <span className="nav-icon"><AppIcon name="close" size={17} /></span>

            {!compactSidebar ? (
              <span>
                Disconnect
              </span>
            ) : null}
          </button>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button menu-button"
              onClick={() =>
                setMobileNavOpen(
                  (current) =>
                    !current
                )
              }
              aria-label="Toggle menu"
            >
              ☰
            </button>

            <button
              type="button"
              className="icon-button collapse-button"
              onClick={() =>
                setCompactSidebar(
                  (current) =>
                    !current
                )
              }
              aria-label="Collapse sidebar"
            >
              {compactSidebar
                ? "→"
                : "←"}
            </button>

            <div className="breadcrumb">
              <span>
                RideX
              </span>

              <span>
                /
              </span>

              <strong>
                {NAV_ITEMS.find(
                  (item) =>
                    item.id ===
                    currentScreen
                )?.label ??
                  "Dashboard"}
              </strong>
            </div>
          </div>

          <div className="topbar-right">
            {globalLoading ? (
              <span className="topbar-loading">
                Syncing…
              </span>
            ) : null}

            <button
              className="button secondary small"
              type="button"
              onClick={refreshCurrentScreen}
              aria-label="Refresh current screen"
              title="Refresh current screen"
            >
              ↻
            </button>

            <span className={`realtime-pill ${realtimeStatus}`}>
              <span className="online-dot" />
              {realtimeStatus === "connected"
                ? "Realtime"
                : realtimeStatus === "reconnecting"
                  ? "Reconnecting"
                  : realtimeStatus === "connecting"
                    ? "Connecting"
                    : "Realtime offline"}
            </span>

            <div className={`api-pill ${browserOnline ? "" : "offline"}`}>
              <span className="online-dot" />
              {browserOnline ? "API Connected" : "Offline"}
            </div>
          </div>
        </header>

        <main className="content">
          {renderCurrentScreen()}
        </main>
      </div>

      {selectedDriver
        ? renderDriverDrawer()
        : null}

      {selectedBooking
        ? renderBookingDrawer()
        : null}

      {selectedCustomer
        ? renderCustomerDrawer()
        : null}

      {selectedSupportCase ? (
        <Drawer
          title={`Support Case ${shortId(
            selectedSupportCase.id,
            20,
          )}`}
          onClose={() => {
            if (!supportReplyLoading) {
              setSelectedSupportCase(null);
              setSupportReply("");
              setSupportAttachmentUrl("");
            }
          }}
        >
          {supportCaseLoading ? (
            <LoadingState message="Loading support conversation…" />
          ) : (
            <>
              <div className="detail-grid">
                <div>
                  <span>Status</span>
                  <strong>
                    <StatusBadge value={selectedSupportCase.status} />
                  </strong>
                </div>
                <div>
                  <span>Priority</span>
                  <strong>
                    <StatusBadge value={selectedSupportCase.priority} />
                  </strong>
                </div>
                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedSupportCase.customerId ?? "—"}
                  </strong>
                </div>
                <div>
                  <span>Driver</span>
                  <strong>
                    {selectedSupportCase.driverId ?? "—"}
                  </strong>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span>Subject</span>
                  <strong>
                    {selectedSupportCase.subject ?? "RideX Support"}
                  </strong>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span>Description</span>
                  <strong>
                    {selectedSupportCase.description ?? "—"}
                  </strong>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Conversation</h3>
                {safeArray<any>(selectedSupportCase.messages).length === 0 ? (
                  <EmptyState
                    title="No messages"
                    message="No support messages are attached to this case."
                  />
                ) : (
                  <div className="support-thread">
                    {safeArray<any>(selectedSupportCase.messages).map(
                      (message) => (
                        <div
                          className={`support-message ${
                            String(message.senderType ?? "")
                              .toUpperCase() === "ADMIN"
                              ? "admin"
                              : ""
                          }`}
                          key={message.id}
                        >
                          <div className="support-message-meta">
                            <strong>
                              {humanize(message.senderType ?? "UNKNOWN")}
                            </strong>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                          <p>{String(message.message ?? "")}</p>
                          {message.attachmentUrl ? (
                            <a
                              className="table-link"
                              href={String(message.attachmentUrl)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open attachment reference
                            </a>
                          ) : null}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="drawer-section">
                <h3>Admin Reply</h3>
                <label>
                  <span className="field-label">Message</span>
                  <textarea
                    className="text-input"
                    rows={5}
                    value={supportReply}
                    onChange={(event) =>
                      setSupportReply(event.target.value)
                    }
                    placeholder="Write the Admin response…"
                  />
                </label>
                <label style={{ marginTop: 12 }}>
                  <span className="field-label">
                    Attachment URL (optional reference)
                  </span>
                  <input
                    className="text-input"
                    value={supportAttachmentUrl}
                    onChange={(event) =>
                      setSupportAttachmentUrl(event.target.value)
                    }
                    placeholder="https://…"
                  />
                </label>
                <div
                  className="button-row"
                  style={{ marginTop: 12 }}
                >
                  <button
                    className="button primary"
                    type="button"
                    onClick={() => void sendSupportReply()}
                    disabled={supportReplyLoading}
                  >
                    {supportReplyLoading ? "Sending…" : "Send Reply"}
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() =>
                      void openSupportCase(
                        String(selectedSupportCase.id),
                      )
                    }
                    disabled={supportReplyLoading}
                  >
                    Refresh Conversation
                  </button>
                </div>
              </div>
            </>
          )}
        </Drawer>
      ) : null}

      {confirmation ? (
        <ConfirmationModal
          title={
            confirmation.title
          }
          description={
            confirmation.description
          }
          expectedText={
            confirmation.expectedText
          }
          value={
            confirmationValue
          }
          setValue={
            setConfirmationValue
          }
          onCancel={() => {
            if (
              !confirmationLoading
            ) {
              setConfirmation(
                null
              );
              setConfirmationValue(
                ""
              );
            }
          }}
          onConfirm={
            executeConfirmation
          }
          loading={
            confirmationLoading
          }
        />
      ) : null}

        {toast ? (
          <div
            className={`toast ${toast.type}`}
          >
            <strong>
              {toast.type ===
              "success"
                ? "Success"
                : toast.type ===
                    "error"
                ? "Error"
                : "Info"}
            </strong>

            <span>
              {toast.message}
            </span>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default App;






