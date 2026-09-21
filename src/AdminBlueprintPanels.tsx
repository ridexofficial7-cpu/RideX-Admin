import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileClock,
  Gauge,
  LockKeyhole,
  Map,
  RefreshCw,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

export type BlueprintApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
};

export type BlueprintApiRequest = <T = unknown>(
  path: string,
  options?: RequestInit,
) => Promise<BlueprintApiResponse<T>>;

type Notify = (type: "success" | "error" | "info", message: string) => void;

export type MatchingTelemetryProps = {
  bookings: Array<Record<string, any>>;
  drivers: Array<Record<string, any>>;
  apiRequest: BlueprintApiRequest;
  notify: Notify;
};

export function MatchingPanel({ bookings, drivers }: MatchingTelemetryProps) {
  const activeStatuses = new Set([
    "MATCHING",
    "DRIVER_ASSIGNED",
    "DRIVER_ARRIVING",
    "DRIVER_ARRIVED",
    "STARTED",
    "IN_PROGRESS",
  ]);
  const activeBookings = bookings.filter((row) => activeStatuses.has(String(row.status ?? "").toUpperCase()));
  const queued = bookings.filter((row) => String(row.status ?? "").toUpperCase() === "MATCHING");
  const assigned = activeBookings.filter((row) => Boolean(row.assignedDriverId)).length;
  const onlineDrivers = drivers.filter((row) => String(row.driverStatus ?? row.location?.isOnline ?? "").toUpperCase() === "ONLINE" || row.location?.isOnline === true);
  const staleDrivers = onlineDrivers.filter((driver) => {
    const timestamp = driver.location?.recordedAt;
    if (!timestamp) return true;

    const recordedAt = new Date(timestamp).getTime();
    if (!Number.isFinite(recordedAt)) return true;

    return Date.now() - recordedAt > 60_000;
  });

  const assignmentRate = activeBookings.length
    ? Math.round((assigned / activeBookings.length) * 100)
    : 0;

  const pressure = Math.max(
    0,
    Math.round(
      (queued.length / Math.max(1, onlineDrivers.length)) * 100,
    ),
  );

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">MATCHING ENGINE</p>
          <h2>Matching Operations</h2>
          <p>Backend-authoritative matching telemetry. No frontend assignment is performed here.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card"><div className="metric-icon"><Gauge size={18}/></div><div className="metric-content"><span>Online Drivers</span><strong>{onlineDrivers.length}</strong></div></div>
        <div className="metric-card"><div className="metric-icon metric-icon-warning"><Clock3 size={18}/></div><div className="metric-content"><span>Matching Queue</span><strong>{queued.length}</strong></div></div>
        <div className="metric-card"><div className="metric-icon metric-icon-success"><CheckCircle2 size={18}/></div><div className="metric-content"><span>Active Assigned</span><strong>{assigned}</strong></div></div>
        <div className="metric-card"><div className="metric-icon metric-icon-info"><Activity size={18}/></div><div className="metric-content"><span>Assignment Ratio</span><strong>{assignmentRate}%</strong></div></div>
        <div className="metric-card"><div className="metric-icon metric-icon-danger"><AlertTriangle size={18}/></div><div className="metric-content"><span>GPS Stale</span><strong>{staleDrivers.length}</strong></div></div>
        <div className="metric-card"><div className="metric-icon"><Map size={18}/></div><div className="metric-content"><span>Queue Pressure</span><strong>{pressure}%</strong></div></div>
      </div>

      <div className="content-grid two">
        <div className="panel">
          <div className="panel-header"><div><p className="eyebrow">LIVE QUEUE</p><h3>Bookings waiting for matching</h3></div></div>
          <div className="table-wrapper"><table><thead><tr><th>Booking</th><th>Service</th><th>Pickup</th><th>Created</th></tr></thead><tbody>
            {queued.map((row) => <tr key={String(row.id)}><td>{String(row.id)}</td><td>{String(row.serviceType ?? row.rideType ?? "—")}</td><td>{String(row.pickupAddress ?? "—")}</td><td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td></tr>)}
            {!queued.length ? <tr><td colSpan={4}>No bookings are currently waiting in MATCHING.</td></tr> : null}
          </tbody></table></div>
        </div>
        <div className="panel">
          <div className="panel-header"><div><p className="eyebrow">CONFIGURATION</p><h3>Matching rules</h3></div></div>
          <div className="info-box"><strong>Backend controlled</strong><p>Dedicated Admin matching-configuration endpoints are not exposed in the currently supplied backend. This screen therefore exposes live telemetry only and will not write undocumented configuration.</p></div>
          <div className="summary-list">
            <div><span>Current online pool</span><strong>{onlineDrivers.length}</strong></div>
            <div><span>Current matching queue</span><strong>{queued.length}</strong></div>
            <div><span>Active trips with driver</span><strong>{assigned}</strong></div>
            <div><span>Stale GPS candidates</span><strong>{staleDrivers.length}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

type EventStop = { name: string; latitude: string; longitude: string };
type EventDraft = { name: string; description: string; workingDate: string; sessionStart: string; sessionEnd: string; capacity: string; fare: string };

type EventsPanelProps = { apiRequest: BlueprintApiRequest; notify: Notify };

export function EventsPanel({ apiRequest, notify }: EventsPanelProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<EventDraft>({ name: "", description: "", workingDate: "", sessionStart: "", sessionEnd: "", capacity: "20", fare: "0" });
  const [stops, setStops] = useState<EventStop[]>([
    { name: "Stop 1", latitude: "", longitude: "" },
    { name: "Stop 2", latitude: "", longitude: "" },
    { name: "Stop 3", latitude: "", longitude: "" },
    { name: "Stop 4", latitude: "", longitude: "" },
    { name: "Stop 5", latitude: "", longitude: "" },
    { name: "Stop 6", latitude: "", longitude: "" },
  ]);

  const loadEvents = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiRequest<any[]>("/admin/events");

      if (response.success === false) {
        throw new Error(
          response.message ?? "Event backend request was rejected",
        );
      }

      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setEvents([]);
      notify(
        "info",
        error instanceof Error
          ? error.message
          : "Event backend endpoint is not available yet",
      );
    } finally {
      setLoading(false);
    }
  }, [apiRequest, notify]);

  useEffect(() => { void loadEvents(); }, [loadEvents]);

  const validStops = useMemo(
    () =>
      stops.filter((stop) => {
        const latitude = Number(stop.latitude);
        const longitude = Number(stop.longitude);

        return (
          Boolean(stop.name.trim()) &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180
        );
      }),
    [stops],
  );

  const createEvent = async () => {
    if (!draft.name.trim()) {
      notify("error", "Event name is required");
      return;
    }

    if (validStops.length < 6 || validStops.length > 10) {
      notify(
        "error",
        "Event must contain 6–10 valid stops before publish",
      );
      return;
    }

    if (!draft.sessionStart || !draft.sessionEnd) {
      notify("error", "At least one session/time window is required");
      return;
    }

    const capacity = Number(draft.capacity);
    const fare = Number(draft.fare);

    if (!Number.isFinite(capacity) || capacity <= 0) {
      notify("error", "Capacity must be greater than zero");
      return;
    }

    if (!Number.isFinite(fare) || fare < 0) {
      notify("error", "Fare must be zero or greater");
      return;
    }

    try {
      const response = await apiRequest("/admin/events", {
        method: "POST",
        body: JSON.stringify({
          name: draft.name.trim(),
          description: draft.description.trim(),
          workingDate: draft.workingDate || null,
          capacity,
          fare,
          stops: validStops.map((stop, index) => ({
            sequence: index + 1,
            name: stop.name.trim(),
            latitude: Number(stop.latitude),
            longitude: Number(stop.longitude),
          })),
          sessions: [
            {
              startTime: draft.sessionStart,
              endTime: draft.sessionEnd,
            },
          ],
        }),
      });

      if (response.success === false) {
        throw new Error(
          response.message ?? "Event creation was rejected by backend",
        );
      }

      notify("success", "Event draft created by backend");
      await loadEvents();
    } catch (error) {
      notify(
        "info",
        error instanceof Error
          ? error.message
          : "Event API is not available yet; no fake event was created",
      );
    }
  };

  const updateStop = (index: number, key: keyof EventStop, value: string) => setStops((current) => current.map((stop, i) => i === index ? { ...stop, [key]: value } : stop));
  const addStop = () => { if (stops.length < 10) setStops((current) => [...current, { name: `Stop ${current.length + 1}`, latitude: "", longitude: "" }]); };
  const removeStop = (index: number) => { if (stops.length > 6) setStops((current) => current.filter((_, i) => i !== index)); };

  return (
    <div className="page">
      <div className="section-header"><div><p className="eyebrow">EVENT / SESSIONAL RIDE</p><h2>Event Management</h2><p>Admin-defined fixed route events with 6–10 stops and scheduled sessions.</p></div><button className="button secondary" type="button" onClick={() => void loadEvents()} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
      <div className="content-grid two">
        <div className="panel">
          <div className="panel-header"><div><p className="eyebrow">EVENT DRAFT</p><h3>Create Event</h3></div></div>
          <div className="detail-grid">
            <label><span className="field-label">Name</span><input className="text-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Katihar Festival Shuttle" /></label>
            <label><span className="field-label">Date (optional)</span><input className="text-input" type="date" value={draft.workingDate} onChange={(e) => setDraft((d) => ({ ...d, workingDate: e.target.value }))} /></label>
            <label><span className="field-label">Session Start</span><input className="text-input" type="time" value={draft.sessionStart} onChange={(e) => setDraft((d) => ({ ...d, sessionStart: e.target.value }))} /></label>
            <label><span className="field-label">Session End</span><input className="text-input" type="time" value={draft.sessionEnd} onChange={(e) => setDraft((d) => ({ ...d, sessionEnd: e.target.value }))} /></label>
            <label><span className="field-label">Capacity</span><input className="text-input" type="number" min={1} value={draft.capacity} onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))} /></label>
            <label><span className="field-label">Fare</span><input className="text-input" type="number" min={0} value={draft.fare} onChange={(e) => setDraft((d) => ({ ...d, fare: e.target.value }))} /></label>
            <label style={{ gridColumn: "1 / -1" }}><span className="field-label">Description</span><textarea className="text-input" rows={3} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Admin-managed event route" /></label>
          </div>
          <div className="panel-header" style={{ marginTop: 16 }}><div><p className="eyebrow">FIXED ROUTE</p><h3>{stops.length} stops</h3></div><div><span className={`status ${validStops.length >= 6 && validStops.length <= 10 ? "success" : "warning"}`}>{validStops.length}/6–10 valid</span></div></div>
          <div className="table-wrapper"><table><thead><tr><th>Seq</th><th>Name</th><th>Latitude</th><th>Longitude</th><th></th></tr></thead><tbody>{stops.map((stop, index) => <tr key={`${index}-${stop.name}`}><td>{index + 1}</td><td><input className="table-input" value={stop.name} onChange={(e) => updateStop(index, "name", e.target.value)} /></td><td><input className="table-input" value={stop.latitude} onChange={(e) => updateStop(index, "latitude", e.target.value)} /></td><td><input className="table-input" value={stop.longitude} onChange={(e) => updateStop(index, "longitude", e.target.value)} /></td><td>{stops.length > 6 ? <button className="button secondary small" type="button" onClick={() => removeStop(index)}>Remove</button> : null}</td></tr>)}</tbody></table></div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button className="button secondary" type="button" onClick={addStop} disabled={stops.length >= 10}>Add Stop</button><button className="button primary" type="button" onClick={() => void createEvent()}>Create Event</button></div>
          <div className="info-box"><strong>Backend status</strong><p>The supplied backend currently has no `/admin/events` endpoint. The form and validation are ready for the backend implementation; it will not fake persistence.</p></div>
        </div>
        <div className="panel">
          <div className="panel-header"><div><p className="eyebrow">PUBLISHED EVENTS</p><h3>{events.length} event(s)</h3></div></div>
          {events.length ? <div className="table-wrapper"><table><thead><tr><th>Event</th><th>Status</th><th>Stops</th><th>Session</th></tr></thead><tbody>{events.map((event) => <tr key={String(event.id)}><td>{String(event.name ?? event.id)}</td><td>{String(event.status ?? "—")}</td><td>{Array.isArray(event.stops) ? event.stops.length : "—"}</td><td>{Array.isArray(event.sessions) ? event.sessions.length : "—"}</td></tr>)}</tbody></table></div> : <div className="info-box"><strong>No backend event records returned</strong><p>Once the Event/Session backend is created, this panel will list drafts, published routes and sessions without another UI rewrite.</p></div>}
        </div>
      </div>
    </div>
  );
}

type FinancePanelProps = { apiRequest: BlueprintApiRequest; notify: Notify };
export function FinancePanel({ apiRequest, notify }: FinancePanelProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsResponse, settlementsResponse] = await Promise.all([
        apiRequest<any[]>("/admin/payments"),
        apiRequest<any[]>("/admin/payouts/settlements"),
      ]);
      setPayments(Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
      setSettlements(Array.isArray(settlementsResponse.data) ? settlementsResponse.data : []);
    } catch (error) { notify("error", error instanceof Error ? error.message : "Unable to load finance data"); }
    finally { setLoading(false); }
  }, [apiRequest, notify]);

  useEffect(() => { void load(); }, [load]);

  const approveAndPay = async (id: string) => {
    const settlementId = id.trim();

    if (!settlementId) {
      notify("error", "Settlement ID is required");
      return;
    }

    try {
      const response = await apiRequest(
        `/admin/payouts/settlements/${encodeURIComponent(settlementId)}/approve-and-pay`,
        {
          method: "POST",
          body: JSON.stringify({ mode: "IMPS" }),
        },
      );

      if (response.success === false) {
        throw new Error(
          response.message ?? "Settlement payout was rejected",
        );
      }

      notify("success", "Settlement payout request submitted");
      await load();
    } catch (error) {
      notify(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to process settlement",
      );
    }
  };
  const reconcile = async () => {
    const normalizedAttemptId = attemptId.trim();

    if (!normalizedAttemptId) {
      notify("error", "Enter a payout attempt ID");
      return;
    }

    try {
      const response = await apiRequest(
        `/admin/payouts/reconcile/${encodeURIComponent(normalizedAttemptId)}`,
        { method: "POST" },
      );

      if (response.success === false) {
        throw new Error(
          response.message ?? "Payout reconciliation was rejected",
        );
      }

      notify("success", "Payout reconciliation completed");
      setAttemptId("");
      await load();
    } catch (error) {
      notify(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to reconcile payout",
      );
    }
  };

  const successPayments = payments
    .filter((row) =>
      ["SUCCESS", "COMPLETED", "PAID"].includes(
        String(row.status ?? "").toUpperCase(),
      ),
    )
    .reduce((sum, row) => {
      const amount = Number(row.amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

  const pendingSettlements = settlements
    .filter((row) =>
      ["PENDING", "ON_HOLD", "PROCESSING"].includes(
        String(row.status ?? "").toUpperCase(),
      ),
    )
    .reduce((sum, row) => {
      const amount = Number(row.amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

  return (
    <div className="page">
      <div className="section-header"><div><p className="eyebrow">FINANCE</p><h2>Payments, Settlements & Reconciliation</h2><p>Cash, UPI and Wallet payment records plus driver settlement controls.</p></div><button className="button secondary" type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
      <div className="metrics-grid"><div className="metric-card"><div className="metric-icon metric-icon-success"><WalletCards size={18}/></div><div className="metric-content"><span>Payment Records</span><strong>{payments.length}</strong></div></div><div className="metric-card"><div className="metric-icon metric-icon-info"><Database size={18}/></div><div className="metric-content"><span>Successful Amount</span><strong>₹{successPayments.toFixed(2)}</strong></div></div><div className="metric-card"><div className="metric-icon metric-icon-warning"><Clock3 size={18}/></div><div className="metric-content"><span>Open Settlement Amount</span><strong>₹{pendingSettlements.toFixed(2)}</strong></div></div><div className="metric-card"><div className="metric-icon"><CheckCircle2 size={18}/></div><div className="metric-content"><span>Settlement Records</span><strong>{settlements.length}</strong></div></div></div>
      <Panelish title="Driver Settlements" subtitle="Approve-and-pay is protected by backend payout-profile and provider checks."><div className="table-wrapper"><table><thead><tr><th>Settlement</th><th>Driver</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{settlements.map((row) => <tr key={String(row.id)}><td>{String(row.id)}</td><td>{String(row.driver?.fullName ?? row.driverId ?? "—")}</td><td>₹{Number(row.amount ?? 0).toFixed(2)}</td><td>{String(row.status ?? "—")}</td><td>{["PENDING", "ON_HOLD"].includes(String(row.status ?? "").toUpperCase()) ? <button className="button primary small" onClick={() => void approveAndPay(String(row.id))}>Approve & Pay</button> : <span className="status success">No action</span>}</td></tr>)}{!settlements.length ? <tr><td colSpan={5}>No settlement records.</td></tr> : null}</tbody></table></div></Panelish>
      <Panelish title="Payout Reconciliation" subtitle="Use the provider payout attempt ID returned by the backend."><div style={{ display: "flex", gap: 8 }}><input className="text-input" value={attemptId} onChange={(e) => setAttemptId(e.target.value)} placeholder="Payout attempt ID"/><button className="button secondary" onClick={() => void reconcile()}>Reconcile</button></div></Panelish>
      <Panelish title="Financial boundary" subtitle="No frontend ledger mutation"><div className="info-box"><strong>Backend source of truth</strong><p>Financial totals, payout states, idempotency and provider reconciliation remain backend-authoritative. This panel exposes controls that already exist in the supplied backend and does not invent refund/ledger endpoints.</p></div></Panelish>
    </div>
  );
}

function Panelish({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <div className="panel"><div className="panel-header"><div><p className="eyebrow">RIDEX CONTROL</p><h3>{title}</h3>{subtitle ? <p>{subtitle}</p> : null}</div></div>{children}</div>;
}

type SecurityPanelProps = { apiRequest: BlueprintApiRequest; notify: Notify };
export function SecurityPanel({ apiRequest, notify }: SecurityPanelProps) {
  const [configStatus, setConfigStatus] = useState<Record<string, any>>({});
  const [audit, setAudit] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [config, auditResponse, rolesResponse, permissionsResponse] = await Promise.all([
        apiRequest<any[]>("/admin/configuration/status"), apiRequest<any[]>("/admin/audit-logs"), apiRequest<any[]>("/admin/roles"), apiRequest<any[]>("/admin/permissions"),
      ]);
      const next: Record<string, any> = {};
      (Array.isArray(config.data) ? config.data : []).forEach((row) => { next[String(row.key)] = row; });
      setConfigStatus(next); setAudit(Array.isArray(auditResponse.data) ? auditResponse.data : []); setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []); setPermissions(Array.isArray(permissionsResponse.data) ? permissionsResponse.data : []);
    } catch (error) { notify("error", error instanceof Error ? error.message : "Unable to load security center"); }
    finally { setLoading(false); }
  }, [apiRequest, notify]);
  useEffect(() => { void load(); }, [load]);
  const configuredCount = Object.values(configStatus).filter((item: any) => item?.configured).length;
  return (
    <div className="page">
      <div className="section-header"><div><p className="eyebrow">SECURITY CENTER</p><h2>Security, OTP & Audit</h2><p>Protected configuration status, RBAC visibility and security audit trail.</p></div><button className="button secondary" type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
      <div className="metrics-grid"><div className="metric-card"><div className="metric-icon metric-icon-success"><LockKeyhole size={18}/></div><div className="metric-content"><span>Configured Secrets</span><strong>{configuredCount}</strong></div></div><div className="metric-card"><div className="metric-icon"><ShieldAlert size={18}/></div><div className="metric-content"><span>Audit Records Loaded</span><strong>{audit.length}</strong></div></div><div className="metric-card"><div className="metric-icon metric-icon-info"><UsersIcon /></div><div className="metric-content"><span>Roles</span><strong>{roles.length}</strong></div></div><div className="metric-card"><div className="metric-icon metric-icon-warning"><FileClock size={18}/></div><div className="metric-content"><span>Permissions</span><strong>{permissions.length}</strong></div></div></div>
      <div className="content-grid two">
        <Panelish title="Protected Provider Configuration" subtitle="Values remain masked; only configured/not-configured state is shown."><div className="table-wrapper"><table><thead><tr><th>Key</th><th>Status</th><th>Last Updated</th></tr></thead><tbody>{Object.keys(configStatus).sort().map((key) => <tr key={key}><td>{key}</td><td><span className={`status ${configStatus[key]?.configured ? "success" : "warning"}`}>{configStatus[key]?.configured ? "Configured" : "Not configured"}</span></td><td>{configStatus[key]?.updatedAt ? new Date(configStatus[key].updatedAt).toLocaleString() : "—"}</td></tr>)}</tbody></table></div></Panelish>
        <Panelish title="OTP Security Configuration" subtitle="Blueprint rule-set readiness"><div className="summary-list"><div><span>Purpose code / category mapping</span><strong>Backend policy</strong></div><div><span>Expiry / wrong attempts</span><strong>Backend policy</strong></div><div><span>Resend / cooldown</span><strong>Backend policy</strong></div><div><span>Push retry policy</span><strong>Backend policy</strong></div></div><div className="info-box"><strong>API gap</strong><p>The supplied backend exposes OTP runtime policy but does not expose an Admin OTP-purpose configuration endpoint/history UI contract. This screen intentionally does not invent a write API.</p></div></Panelish>
      </div>
      <Panelish title="Recent Security Audit" subtitle="Separate from simple configuration history"><div className="table-wrapper"><table><thead><tr><th>Time</th><th>Module</th><th>Action</th><th>Entity</th><th>Admin</th></tr></thead><tbody>{audit.slice(0, 25).map((row) => <tr key={String(row.id)}><td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td><td>{String(row.module ?? "—")}</td><td>{String(row.action ?? "—")}</td><td>{String(row.entityType ?? "—")} {row.entityId ? `· ${String(row.entityId).slice(0, 10)}` : ""}</td><td>{String(row.admin?.name ?? row.adminId ?? "—")}</td></tr>)}</tbody></table></div></Panelish>
    </div>
  );
}

function UsersIcon() { return <span style={{ fontSize: 16, fontWeight: 900 }}>RBAC</span>; }

type MonitoringPanelProps = { apiRequest: BlueprintApiRequest; notify: Notify };
export function MonitoringPanel({ apiRequest, notify }: MonitoringPanelProps) {
  const [health, setHealth] = useState<any | null>(null);
  const [platform, setPlatform] = useState<any | null>(null);
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [mergeName, setMergeName] = useState("Historical + Current Data Review");
  const [mergeId, setMergeId] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [healthResponse, platformResponse, testRunsResponse] = await Promise.all([
        apiRequest<any>("/health"), apiRequest<any>("/admin/platform/state"), apiRequest<any[]>("/admin/test-runs"),
      ]);
      setHealth(healthResponse); setPlatform(platformResponse); setTestRuns(Array.isArray(testRunsResponse.data) ? testRunsResponse.data : []);
    } catch (error) { notify("error", error instanceof Error ? error.message : "Unable to load monitoring state"); }
    finally { setLoading(false); }
  }, [apiRequest, notify]);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 30_000); return () => window.clearInterval(timer); }, [load]);

  const createMergeJob = async () => {
    const name = mergeName.trim();

    if (!name) {
      notify("error", "Merge review job name is required");
      return;
    }

    try {
      const response = await apiRequest<any>("/admin/data-merge", {
        method: "POST",
        body: JSON.stringify({
          name,
          sourceScope: "HISTORICAL_CURRENT",
        }),
      });

      if (response.success === false) {
        throw new Error(
          response.message ?? "Merge review job was rejected",
        );
      }

      const id = String(response.data?.id ?? "");

      setMergeId(id);
      notify(
        "success",
        id
          ? `Merge review job created: ${id}`
          : "Merge review job created",
      );
    } catch (error) {
      notify(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to create merge review job",
      );
    }
  };

  const reviewMerge = async (approved: boolean) => {
    const id = mergeId.trim();

    if (!id) {
      notify("error", "Enter a merge job ID");
      return;
    }

    try {
      const response = await apiRequest(
        `/admin/data-merge/${encodeURIComponent(id)}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({ approved }),
        },
      );

      if (response.success === false) {
        throw new Error(
          response.message ?? "Merge review was rejected",
        );
      }

      notify(
        "success",
        approved
          ? "Merge job marked reviewed"
          : "Merge job rejected",
      );
    } catch (error) {
      notify(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to review merge job",
      );
    }
  };

  const backupAvailable = Boolean((platform as any)?.backup || (health as any)?.data?.backup);
  return (
    <div className="page">
      <div className="section-header"><div><p className="eyebrow">MONITORING & RECOVERY</p><h2>Platform Health</h2><p>Backend health, release state, TEST runs, data-merge review and backup visibility.</p></div><button className="button secondary" type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
      <div className="metrics-grid"><div className="metric-card"><div className="metric-icon metric-icon-success"><Activity size={18}/></div><div className="metric-content"><span>API</span><strong>{String(health?.status ?? health?.data?.status ?? "UNKNOWN")}</strong></div></div><div className="metric-card"><div className="metric-icon metric-icon-info"><Database size={18}/></div><div className="metric-content"><span>Database</span><strong>{String(health?.database ?? health?.data?.database ?? "UNKNOWN")}</strong></div></div><div className="metric-card"><div className="metric-icon metric-icon-warning"><FileClock size={18}/></div><div className="metric-content"><span>TEST Runs</span><strong>{testRuns.length}</strong></div></div><div className="metric-card"><div className="metric-icon"><ShieldAlert size={18}/></div><div className="metric-content"><span>Backup API</span><strong>{backupAvailable ? "EXPOSED" : "NOT EXPOSED"}</strong></div></div></div>
      <div className="content-grid two">
        <Panelish title="Runtime / Release State"><div className="summary-list"><div><span>Mode</span><strong>{String(health?.mode ?? health?.data?.mode ?? platform?.runtimeEnvironment ?? "—")}</strong></div><div><span>Active Environment</span><strong>{String(platform?.control?.activeEnvironment ?? "—")}</strong></div><div><span>Current Version</span><strong>{String(platform?.control?.currentVersion ?? "—")}</strong></div><div><span>Deployment Status</span><strong>{String(platform?.control?.deploymentStatus ?? "—")}</strong></div></div></Panelish>
        <Panelish title="Backup / Recovery"><div className="info-box"><strong>{backupAvailable ? "Backend backup status exposed" : "Backend backup status not exposed"}</strong><p>{backupAvailable ? "The monitoring API returned a backup indicator." : "The supplied backend does not expose backup/snapshot/restore endpoints. No fake backup control is presented."}</p></div><div style={{ marginTop: 12 }} className="summary-list"><div><span>Automatic snapshots</span><strong>{backupAvailable ? "Backend reported" : "Pending backend"}</strong></div><div><span>Admin restore</span><strong>{backupAvailable ? "Backend reported" : "Pending backend"}</strong></div><div><span>Failover/recovery</span><strong>{backupAvailable ? "Backend reported" : "Pending backend"}</strong></div></div></Panelish>
      </div>
      <Panelish title="Historical / Current Data Merge" subtitle="Review-controlled data merge jobs"><div style={{ display: "flex", gap: 8, marginBottom: 10 }}><input className="text-input" value={mergeName} onChange={(e) => setMergeName(e.target.value)} /><button className="button primary" onClick={() => void createMergeJob()}>Create Review Job</button></div><div style={{ display: "flex", gap: 8 }}><input className="text-input" value={mergeId} onChange={(e) => setMergeId(e.target.value)} placeholder="Merge job ID"/><button className="button secondary" onClick={() => void reviewMerge(true)}>Mark Reviewed</button><button className="button secondary" onClick={() => void reviewMerge(false)}>Reject</button></div></Panelish>
      <Panelish title="Recent TEST Runs"><div className="table-wrapper"><table><thead><tr><th>Release</th><th>Status</th><th>Passed</th><th>Failed</th><th>Completed</th></tr></thead><tbody>{testRuns.slice(0, 20).map((row) => <tr key={String(row.id)}><td>{String(row.releaseId ?? "—")}</td><td>{String(row.status ?? "—")}</td><td>{String(row.passed ?? 0)}</td><td>{String(row.failed ?? 0)}</td><td>{row.completedAt ? new Date(row.completedAt).toLocaleString() : "—"}</td></tr>)}</tbody></table></div></Panelish>
    </div>
  );
}
