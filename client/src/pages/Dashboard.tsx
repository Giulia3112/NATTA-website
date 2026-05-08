import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutGrid, ExternalLink, ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const STATUSES_OPTIONS = [
  { value: "Considering", color: "bg-purple-100 text-purple-700" },
  { value: "Applied", color: "bg-blue-100 text-blue-700" },
  { value: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  { value: "Accepted", color: "bg-green-100 text-green-700" },
  { value: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "One Day", color: "bg-gray-100 text-gray-600" },
] as const;

const STATUSES = ["Considering", "Applied", "In Progress", "Accepted", "Rejected", "One Day"] as const;

type FormStatus = "Considering" | "Applied" | "In Progress" | "Accepted" | "Rejected" | "One Day";
const EMPTY_FORM = { customTitle: "", customOrganizer: "", customLink: "", customDeadline: "", status: "Applied" as FormStatus, notes: "" };

export default function Dashboard() {
  const { user, isAuthenticated, loading, error, logout, serverAuthFailed } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "calendar">("kanban");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const { t } = useTranslation();

  const applicationsQuery = trpc.applications.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateStatusMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => applicationsQuery.refetch(),
  });

  const deleteMutation = trpc.applications.delete.useMutation({
    onSuccess: () => applicationsQuery.refetch(),
  });

  const createCustomMutation = trpc.applications.createCustom.useMutation({
    onSuccess: () => {
      toast.success(t("dashboard.toast.added"));
      setShowAddModal(false);
      setForm({ ...EMPTY_FORM });
      applicationsQuery.refetch();
    },
    onError: (err) => toast.error(err.message ?? t("dashboard.toast.error")),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const isServerError = !!error || serverAuthFailed;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-bold mb-4">
            {isServerError ? t("dashboard.authErrorTitle") : t("dashboard.authRestrictedTitle")}
          </h1>
          <p className="text-gray-600 mb-6">
            {isServerError ? t("dashboard.authErrorBody") : t("dashboard.authRestrictedBody")}
          </p>
          <div className="flex gap-3 justify-center">
            {isServerError ? (
              <Button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={() => logout()}>
                {t("dashboard.authLogout")}
              </Button>
            ) : (
              <Link href="/login">
                <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {t("dashboard.authLogin")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const applications = applicationsQuery.data ?? [];

  const getByStatus = (status: string) =>
    applications.filter((app) => app.status === status);

  const STATUS_THEME: Record<string, { column: string; card: string; border: string; dot: string; text: string; header: string }> = {
    "Considering": {
      column: "bg-purple-50 border-purple-200",
      card: "border-l-4 border-l-purple-400 bg-white hover:shadow-purple-100",
      border: "border border-purple-100",
      dot: "bg-purple-400",
      text: "text-purple-700",
      header: "text-purple-700",
    },
    "Applied": {
      column: "bg-blue-50 border-blue-200",
      card: "border-l-4 border-l-blue-400 bg-white hover:shadow-blue-100",
      border: "border border-blue-100",
      dot: "bg-blue-400",
      text: "text-blue-700",
      header: "text-blue-700",
    },
    "In Progress": {
      column: "bg-yellow-50 border-yellow-200",
      card: "border-l-4 border-l-yellow-400 bg-white hover:shadow-yellow-100",
      border: "border border-yellow-100",
      dot: "bg-yellow-400",
      text: "text-yellow-700",
      header: "text-yellow-700",
    },
    "Accepted": {
      column: "bg-green-50 border-green-200",
      card: "border-l-4 border-l-green-400 bg-white hover:shadow-green-100",
      border: "border border-green-100",
      dot: "bg-green-400",
      text: "text-green-700",
      header: "text-green-700",
    },
    "Rejected": {
      column: "bg-red-50 border-red-200",
      card: "border-l-4 border-l-red-400 bg-white hover:shadow-red-100",
      border: "border border-red-100",
      dot: "bg-red-400",
      text: "text-red-700",
      header: "text-red-700",
    },
    "One Day": {
      column: "bg-gray-50 border-gray-200",
      card: "border-l-4 border-l-gray-400 bg-white hover:shadow-gray-100",
      border: "border border-gray-100",
      dot: "bg-gray-400",
      text: "text-gray-500",
      header: "text-gray-600",
    },
  };

  const acceptedWithDates = applications.filter(
    (a) => a.status === "Accepted" && a.programStartDate && a.programEndDate
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-3 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/natta-logo.png" alt="NATTA" className="h-7 sm:h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-gray-600 mr-1">
              {t("dashboard.hello")} {user?.name?.split(" ")[0]}!
            </span>
            <Link href="/opportunities">
              <Button variant="outline" className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <span className="hidden sm:inline">{t("dashboard.explore")}</span>
                <ArrowRight className="w-4 h-4 sm:hidden" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                {t("nav.profile")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">{t("dashboard.title")}</h1>
            <p className="text-sm sm:text-base text-gray-600">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ease-in-out"
            >
              <Plus className="w-4 h-4" />
              <span className="sm:inline">{t("dashboard.add")}</span>
            </button>
            <Link href="/opportunities" className="flex-1 sm:flex-none">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ease-in-out">
                <ArrowRight className="w-4 h-4" />
                <span className="sm:inline">{t("dashboard.explore")}</span>
              </button>
            </Link>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6 sm:mb-8">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
              viewMode === "kanban" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            {t("dashboard.kanban")}
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
              viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            {t("dashboard.calendar")}
          </button>
        </div>

        {/* Loading state */}
        {applicationsQuery.isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!applicationsQuery.isLoading && applications.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("dashboard.emptyTitle")}</h2>
            <p className="text-gray-600 mb-6">{t("dashboard.emptyBody")}</p>
            <Link href="/opportunities">
              <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                {t("dashboard.emptyBtn")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Kanban View */}
        {!applicationsQuery.isLoading && viewMode === "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {STATUSES.map((status) => {
              const theme = STATUS_THEME[status] ?? STATUS_THEME["Applied"];
              return (
                <div key={status} className={`rounded-xl p-4 border ${theme.column}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${theme.dot}`} />
                    <h3 className={`font-bold text-base ${theme.header}`}>{status}</h3>
                    <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${theme.dot.replace("bg-", "bg-").replace("-400", "-100")} ${theme.text}`}>
                      {getByStatus(status).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {getByStatus(status).map((app) => (
                      <div key={app.id} className={`rounded-lg p-4 ${theme.card} ${theme.border} hover:shadow-md transition-all duration-300 ease-in-out`}>
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{app.title ?? t("dashboard.kanbanEmpty")}</h4>
                        <p className="text-sm text-gray-500 mb-2">{app.organizer ?? "—"}</p>
                        {app.deadline && (
                          <div className={`text-xs mb-2 font-medium ${theme.text}`}>
                            {t("dashboard.deadline")} {new Date(app.deadline).toLocaleDateString()}
                          </div>
                        )}
                        {app.notes && (
                          <p className="text-xs text-gray-400 mb-3 italic line-clamp-2">&quot;{app.notes}&quot;</p>
                        )}
                        <div className="flex gap-2 items-center">
                          <select
                            value={status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                applicationId: app.id,
                                status: e.target.value as typeof STATUSES[number],
                              })
                            }
                            className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded bg-white focus:ring-2 focus:ring-blue-500"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {app.opportunityId ? (
                            <Link href={`/opportunities/${app.opportunityId}`}>
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 ease-in-out" title={t("dashboard.viewOpportunity")}>
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </Link>
                          ) : (app as any).customLink ? (
                            <a href={(app as any).customLink} target="_blank" rel="noopener noreferrer">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 ease-in-out" title={t("dashboard.openLink")}>
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </a>
                          ) : null}
                          <button
                            onClick={() => deleteMutation.mutate(app.id)}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-all duration-300 ease-in-out"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {getByStatus(status).length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-8">{t("dashboard.kanbanEmpty")}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Calendar View */}
        {!applicationsQuery.isLoading && viewMode === "calendar" && (
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-gray-900">{t("dashboard.calendarTitle")}</h3>
            {acceptedWithDates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t("dashboard.calendarEmpty")}</p>
            ) : (
              <div className="space-y-6">
                {acceptedWithDates
                  .sort((a, b) => new Date(a.programStartDate!).getTime() - new Date(b.programStartDate!).getTime())
                  .map((app) => {
                    const start = new Date(app.programStartDate!);
                    const end = new Date(app.programEndDate!);
                    const conflicts = acceptedWithDates.filter((other) => {
                      if (other.id === app.id) return false;
                      const os = new Date(other.programStartDate!);
                      const oe = new Date(other.programEndDate!);
                      return start <= oe && end >= os;
                    });
                    const hasConflict = conflicts.length > 0;
                    return (
                      <div key={app.id} className={`p-6 rounded-lg border-2 ${hasConflict ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-1">{app.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{app.organizer}</p>
                            <div className="flex gap-4 text-sm">
                              <span><strong>{t("dashboard.start")}</strong> {start.toLocaleDateString()}</span>
                              <span><strong>{t("dashboard.end")}</strong> {end.toLocaleDateString()}</span>
                            </div>
                          </div>
                          {hasConflict && (
                            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">{t("dashboard.conflictBadge")}</span>
                          )}
                        </div>
                        {hasConflict && (
                          <div className="mt-3 p-3 bg-white rounded border border-red-200">
                            <p className="text-sm font-semibold text-red-900 mb-1">{t("dashboard.overlapWith")}</p>
                            {conflicts.map((c) => (
                              <p key={c.id} className="text-sm text-red-800">• {c.title}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Conflict warning */}
        {applications.filter((a) => a.status === "Accepted").length > 1 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-yellow-900 mb-1">{t("dashboard.conflictTitle")}</h3>
            <p className="text-yellow-800 text-sm">
              {t("dashboard.conflictBody", { count: applications.filter((a) => a.status === "Accepted").length })}
            </p>
          </div>
        )}
      </div>

      {/* Add Custom Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t("dashboard.addModal.title")}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{t("dashboard.addModal.subtitle")}</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setForm({ ...EMPTY_FORM }); }}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("dashboard.addModal.nameLabel")}
                </label>
                <input
                  type="text"
                  value={form.customTitle}
                  onChange={(e) => setForm({ ...form, customTitle: e.target.value })}
                  placeholder={t("dashboard.addModal.namePlaceholder")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("dashboard.addModal.organizerLabel")}</label>
                <input
                  type="text"
                  value={form.customOrganizer}
                  onChange={(e) => setForm({ ...form, customOrganizer: e.target.value })}
                  placeholder={t("dashboard.addModal.organizerPlaceholder")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("dashboard.addModal.linkLabel")}</label>
                <input
                  type="url"
                  value={form.customLink}
                  onChange={(e) => setForm({ ...form, customLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("dashboard.addModal.deadlineLabel")}</label>
                <input
                  type="date"
                  value={form.customDeadline}
                  onChange={(e) => setForm({ ...form, customDeadline: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("dashboard.addModal.stageLabel")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: s.value as FormStatus })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        form.status === s.value
                          ? s.color + " border-current"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("dashboard.addModal.notesLabel")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("dashboard.addModal.notesPlaceholder")}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowAddModal(false); setForm({ ...EMPTY_FORM }); }}
              >
                {t("dashboard.addModal.cancel")}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!form.customTitle.trim() || createCustomMutation.isPending}
                onClick={() =>
                  createCustomMutation.mutate({
                    customTitle: form.customTitle,
                    customOrganizer: form.customOrganizer || undefined,
                    customLink: form.customLink || undefined,
                    customDeadline: form.customDeadline ? new Date(form.customDeadline) : undefined,
                    status: form.status,
                    notes: form.notes || undefined,
                  })
                }
              >
                {createCustomMutation.isPending ? t("dashboard.addModal.adding") : t("dashboard.addModal.addBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
