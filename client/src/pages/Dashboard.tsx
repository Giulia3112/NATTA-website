import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutGrid, ExternalLink, ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUSES_OPTIONS = [
  { value: "Considering", label: "Considering", color: "bg-purple-100 text-purple-700" },
  { value: "Applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { value: "In Progress", label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  { value: "Accepted", label: "Accepted", color: "bg-green-100 text-green-700" },
  { value: "Rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "One Day", label: "One Day", color: "bg-gray-100 text-gray-600" },
] as const;

const STATUSES = ["Considering", "Applied", "In Progress", "Accepted", "Rejected", "One Day"] as const;

const EMPTY_FORM = { customTitle: "", customOrganizer: "", customLink: "", customDeadline: "", status: "Applied" as const, notes: "" };

export default function Dashboard() {
  const { user, isAuthenticated, loading, error, logout, serverAuthFailed } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "calendar">("kanban");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

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
      toast.success("Candidatura adicionada!");
      setShowAddModal(false);
      setForm({ ...EMPTY_FORM });
      applicationsQuery.refetch();
    },
    onError: (err) => toast.error(err.message ?? "Erro ao adicionar"),
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
            {isServerError ? "Erro de Autenticação" : "Acesso Restrito"}
          </h1>
          <p className="text-gray-600 mb-6">
            {isServerError
              ? "Você está logado, mas o servidor não conseguiu verificar sua sessão. Tente sair e entrar novamente."
              : "Você precisa estar autenticado para acessar o dashboard."}
          </p>
          <div className="flex gap-3 justify-center">
            {isServerError ? (
              <Button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700" onClick={() => logout()}>
                Sair e tentar novamente
              </Button>
            ) : (
              <Link href="/login">
                <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Fazer Login
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Considering": return "bg-purple-100 text-purple-700";
      case "Accepted": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "In Progress": return "bg-yellow-100 text-yellow-700";
      case "One Day": return "bg-gray-100 text-gray-600";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const acceptedWithDates = applications.filter(
    (a) => a.status === "Accepted" && a.programStartDate && a.programEndDate
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Olá, {user?.name?.split(" ")[0]}!</span>
            <Link href="/opportunities">
              <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Explorar
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Perfil
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Minhas Candidaturas</h1>
            <p className="text-gray-600">Acompanhe todas as suas candidaturas em um só lugar</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-semibold transition-all duration-300 ease-in-out"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
            <Link href="/opportunities">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold transition-all duration-300 ease-in-out">
                <ArrowRight className="w-5 h-5" />
                Explorar
              </button>
            </Link>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
              viewMode === "kanban" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
              viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Calendário
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma candidatura ainda</h2>
            <p className="text-gray-600 mb-6">
              Explore as oportunidades disponíveis e candidate-se para começar a acompanhar seu progresso aqui.
            </p>
            <Link href="/opportunities">
              <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                Explorar Oportunidades
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Kanban View */}
        {!applicationsQuery.isLoading && viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STATUSES.map((status) => (
              <div key={status} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-900">
                  {status}
                  <span className="ml-2 text-sm text-gray-500">({getByStatus(status).length})</span>
                </h3>
                <div className="space-y-3">
                  {getByStatus(status).map((app) => (
                    <div key={app.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300 ease-in-out">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{app.title ?? "Sem título"}</h4>
                      <p className="text-sm text-gray-600 mb-2">{app.organizer ?? "—"}</p>
                      {app.deadline && (
                        <div className="text-xs text-gray-500 mb-2">
                          Prazo: {new Date(app.deadline).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      {app.notes && (
                        <p className="text-xs text-gray-500 mb-3 italic line-clamp-2">&quot;{app.notes}&quot;</p>
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
                          className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {app.opportunityId ? (
                          <Link href={`/opportunities/${app.opportunityId}`}>
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 ease-in-out" title="Ver oportunidade">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                        ) : (app as any).customLink ? (
                          <a href={(app as any).customLink} target="_blank" rel="noopener noreferrer">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 ease-in-out" title="Abrir link">
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
                    <p className="text-gray-400 text-sm text-center py-8">Vazio</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {!applicationsQuery.isLoading && viewMode === "calendar" && (
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Timeline de Programas & Conflitos</h3>
            {acceptedWithDates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma candidatura aceita com datas para exibir
              </p>
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
                              <span><strong>Início:</strong> {start.toLocaleDateString("pt-BR")}</span>
                              <span><strong>Fim:</strong> {end.toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                          {hasConflict && (
                            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">⚠️ Conflito</span>
                          )}
                        </div>
                        {hasConflict && (
                          <div className="mt-3 p-3 bg-white rounded border border-red-200">
                            <p className="text-sm font-semibold text-red-900 mb-1">Sobreposição com:</p>
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
            <h3 className="font-bold text-yellow-900 mb-1">⚠️ Verifique conflitos de datas</h3>
            <p className="text-yellow-800 text-sm">
              Você tem {applications.filter((a) => a.status === "Accepted").length} candidaturas aceitas. Confira o Calendário para detectar sobreposições.
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
                <h2 className="text-xl font-bold text-gray-900">Adicionar Candidatura</h2>
                <p className="text-sm text-gray-500 mt-0.5">Registre uma oportunidade de qualquer lugar</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setForm({ ...EMPTY_FORM }); }}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da oportunidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.customTitle}
                  onChange={(e) => setForm({ ...form, customTitle: e.target.value })}
                  placeholder="Ex: Fulbright Scholarship 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Organizer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organização</label>
                <input
                  type="text"
                  value={form.customOrganizer}
                  onChange={(e) => setForm({ ...form, customOrganizer: e.target.value })}
                  placeholder="Ex: U.S. Department of State"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link da oportunidade</label>
                <input
                  type="url"
                  value={form.customLink}
                  onChange={(e) => setForm({ ...form, customLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de inscrição</label>
                <input
                  type="date"
                  value={form.customDeadline}
                  onChange={(e) => setForm({ ...form, customDeadline: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estágio atual</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: s.value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        form.status === s.value
                          ? s.color + " border-current"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Documentos necessários, próximos passos..."
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
                Cancelar
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
                {createCustomMutation.isPending ? "Adicionando..." : "Adicionar ao Kanban"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
