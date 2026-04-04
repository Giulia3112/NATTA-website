import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Check, X, Trash2, Pencil, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

type PendingOpp = {
  id: number;
  url: string;
  title: string;
  description: string | null;
  organizer: string;
  deadline: Date | string | null;
  opportunityType: string;
  stage: string;
  regions: string[];
  fields: string[];
  mode: string;
  funding: string;
  fee: string;
  requirements: string | null;
  benefits: string | null;
  fundingAmount: string | null;
  applicationLink: string | null;
  confidence: string;
};

const OPPORTUNITY_TYPES = ["Scholarship", "Fellowship", "Accelerator", "Incubator", "Competition", "Internship", "Grant", "Conference", "Exchange Program"] as const;
const STAGES = ["High school", "Undergraduate", "Graduate", "Startup idea", "MVP", "Revenue", "Scale", "Multi-stage"] as const;
const MODES = ["Online", "In-person", "Hybrid"] as const;
const FUNDINGS = ["Fully funded", "Partial", "Stipend", "Equity-based", "Not certain"] as const;

function EditModal({ opp, onClose, onSave }: { opp: PendingOpp; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    title: opp.title,
    organizer: opp.organizer,
    description: opp.description ?? "",
    deadline: opp.deadline ? new Date(opp.deadline as string).toISOString().split("T")[0] : "",
    opportunityType: opp.opportunityType as typeof OPPORTUNITY_TYPES[number],
    stage: opp.stage as typeof STAGES[number],
    mode: opp.mode as typeof MODES[number],
    funding: opp.funding as typeof FUNDINGS[number],
    fee: (opp.fee ?? "No-fee") as "No-fee" | "Paid",
    regions: opp.regions.join(", "),
    fields: opp.fields.join(", "),
    fundingAmount: opp.fundingAmount ?? "",
    applicationLink: opp.applicationLink ?? "",
    requirements: opp.requirements ?? "",
    benefits: opp.benefits ?? "",
  });

  const handleSave = () => {
    onSave({
      title: form.title,
      organizer: form.organizer,
      description: form.description || undefined,
      deadline: form.deadline || undefined,
      opportunityType: form.opportunityType,
      stage: form.stage,
      mode: form.mode,
      funding: form.funding,
      fee: form.fee,
      regions: form.regions.split(",").map((s) => s.trim()).filter(Boolean),
      fields: form.fields.split(",").map((s) => s.trim()).filter(Boolean),
      fundingAmount: form.fundingAmount || undefined,
      applicationLink: form.applicationLink || undefined,
      requirements: form.requirements || undefined,
      benefits: form.benefits || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Editar antes de aprovar</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-semibold mb-1 block">Título *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold mb-1 block">Organizador *</label>
              <Input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Tipo</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.opportunityType}
                onChange={(e) => setForm({ ...form, opportunityType: e.target.value as any })}
              >
                {OPPORTUNITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Estágio</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value as any })}
              >
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Modo</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value as any })}
              >
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Financiamento</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.funding}
                onChange={(e) => setForm({ ...form, funding: e.target.value as any })}
              >
                {FUNDINGS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Taxa de inscrição</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value as any })}
              >
                <option value="No-fee">Gratuito</option>
                <option value="Paid">Pago</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Prazo</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold mb-1 block">Regiões (separadas por vírgula)</label>
              <Input value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} placeholder="Global, Brazil, Latin America" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold mb-1 block">Áreas (separadas por vírgula)</label>
              <Input value={form.fields} onChange={(e) => setForm({ ...form, fields: e.target.value })} placeholder="Tech, Business, Social Impact" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Valor do financiamento</label>
              <Input value={form.fundingAmount} onChange={(e) => setForm({ ...form, fundingAmount: e.target.value })} placeholder="$10,000" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Link de inscrição</label>
              <Input value={form.applicationLink} onChange={(e) => setForm({ ...form, applicationLink: e.target.value })} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold mb-1 block">Descrição</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">
              <Check className="mr-2 h-4 w-4" /> Aprovar com edições
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminScraper() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [editingOpp, setEditingOpp] = useState<PendingOpp | null>(null);

  if (!authLoading && user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const utils = trpc.useUtils();
  const { data: pending, isLoading } = trpc.scraper.getPending.useQuery(undefined, { enabled: user?.role === "admin" });

  const hasScraperAccess = user?.email === "alvaresgiulia@gmail.com";

  const startScrapingMutation = trpc.scraper.startScraping.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.scraper.getPending.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const approveMutation = trpc.scraper.approve.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade aprovada e adicionada ao banco");
      utils.scraper.getPending.invalidate();
      setEditingOpp(null);
    },
    onError: (err) => toast.error(`Erro ao aprovar: ${err.message}`),
  });

  const rejectMutation = trpc.scraper.reject.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade rejeitada");
      utils.scraper.getPending.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const approveAllMutation = trpc.scraper.approveAll.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.scraper.getPending.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const clearPendingMutation = trpc.scraper.clearPending.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.scraper.getPending.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const confidenceColor = (c: string) => {
    const n = parseFloat(c);
    if (n >= 0.85) return "default";
    if (n >= 0.7) return "secondary";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {editingOpp && (
        <EditModal
          opp={editingOpp}
          onClose={() => setEditingOpp(null)}
          onSave={(edits) => approveMutation.mutate({ id: editingOpp.id, edits })}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link href="/">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/opportunities" className="text-gray-700 hover:text-primary transition-colors">Oportunidades</Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/admin/users" className="text-gray-700 hover:text-primary transition-colors">Usuários</Link>
            <Link href="/profile"><Button variant="default">Perfil</Button></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Scraper de Oportunidades</h1>
          <p className="text-gray-600">Descubra e revise oportunidades automaticamente de fontes confiáveis</p>
        </div>

        {!hasScraperAccess && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <p className="text-amber-800 text-sm">
                ⚠️ <strong>Acesso restrito:</strong> Apenas o admin principal pode iniciar o scraping.
                Você pode revisar e aprovar oportunidades pendentes.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => startScrapingMutation.mutate()}
            disabled={startScrapingMutation.isPending || !hasScraperAccess}
            size="lg"
            className="gap-2"
          >
            {startScrapingMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Buscando sites...</>
            ) : (
              <><Play className="h-4 w-4" /> Iniciar Scraping</>
            )}
          </Button>

          {pending && pending.length > 0 && (
            <>
              <Button
                onClick={() => approveAllMutation.mutate()}
                disabled={approveAllMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                {approveAllMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Aprovando...</>
                ) : (
                  <><Check className="h-4 w-4" /> Aprovar Todas ({pending.length})</>
                )}
              </Button>

              <Button
                onClick={() => clearPendingMutation.mutate()}
                disabled={clearPendingMutation.isPending}
                variant="destructive"
                className="gap-2"
              >
                {clearPendingMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Limpando...</>
                ) : (
                  <><Trash2 className="h-4 w-4" /> Descartar Todas</>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Pending list */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">
            Aguardando Revisão ({pending?.length ?? 0})
          </h2>

          {!pending || pending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Nenhuma oportunidade pendente. Clique em "Iniciar Scraping" para buscar novas oportunidades.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5">
              {pending.map((opp) => (
                <Card key={opp.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 truncate">{opp.title}</CardTitle>
                        <CardDescription>
                          {opp.organizer}
                          {opp.deadline && (
                            <> · Prazo: {new Date(opp.deadline).toLocaleDateString("pt-BR")}</>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant={confidenceColor(opp.confidence)}>
                        {Math.round(parseFloat(opp.confidence) * 100)}% confiança
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                      <div><span className="font-semibold">Tipo:</span> {opp.opportunityType}</div>
                      <div><span className="font-semibold">Estágio:</span> {opp.stage}</div>
                      <div><span className="font-semibold">Modo:</span> {opp.mode}</div>
                      <div><span className="font-semibold">Funding:</span> {opp.funding}</div>
                      <div><span className="font-semibold">Taxa:</span> {opp.fee === "No-fee" ? "Gratuito" : "Pago"}</div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1">
                      {opp.regions.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                      ))}
                      {opp.fields.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>

                    {opp.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{opp.description}</p>
                    )}

                    {/* Source URL */}
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Ver fonte
                    </a>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({ id: opp.id })}
                        disabled={approveMutation.isPending}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" /> Aprovar
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingOpp(opp as PendingOpp)}
                        className="gap-1"
                      >
                        <Pencil className="h-4 w-4" /> Editar e Aprovar
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => rejectMutation.mutate({ id: opp.id })}
                        disabled={rejectMutation.isPending}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" /> Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
