import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, ArrowLeft, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const OPPORTUNITY_TYPES = ['Scholarship', 'Fellowship', 'Accelerator', 'Incubator', 'Competition', 'Internship', 'Grant', 'Conference', 'Exchange Program'];
const STAGES = ['High school', 'Undergraduate', 'Graduate', 'Startup idea', 'MVP', 'Revenue', 'Scale', 'Multi-stage'];
const MODES = ['Online', 'In-person', 'Hybrid'];
const FUNDING_TYPES = ['Fully funded', 'Partial', 'Stipend', 'Equity-based', 'Not certain'];
const FEE_TYPES = ['No-fee', 'Paid'];
const REGIONS = ['Global', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'India', 'Brazil', 'USA', 'UK', 'Canada', 'Australia', 'LATAM', 'Southeast Asia', 'East Asia', 'Middle East'];
const FIELDS = [
  'Tech', 'Engineering', 'AI/ML', 'Blockchain', 'Data Science', 'Cybersecurity', 'Robotics',
  'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Astronomy', 'Geology', 'Environmental Science',
  'Health', 'Medicine', 'Nursing', 'Public Health', 'Pharmacy', 'Biotechnology', 'Neuroscience',
  'Psychology', 'Sociology', 'Anthropology', 'Economics', 'Political Science', 'Geography',
  'Literature', 'History', 'Philosophy', 'Languages', 'Arts', 'Music', 'Theater',
  'Business', 'Finance', 'Entrepreneurship', 'Marketing', 'Management',
  'Agriculture', 'Architecture', 'Urban Planning', 'Design',
  'Climate', 'Sustainability', 'Energy', 'Transportation', 'Social Impact', 'Policy', 'Education', 'Law',
];

export default function EditOpportunity() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/edit-opportunity/:id");
  const opportunityId = params?.id ? parseInt(params.id) : null;

  const { data: opportunity, isLoading: oppLoading } = trpc.opportunities.getById.useQuery(
    opportunityId!,
    { enabled: !!opportunityId }
  );

  const utils = trpc.useUtils();
  const updateMutation = trpc.opportunities.update.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade atualizada com sucesso!");
      utils.opportunities.list.invalidate();
      navigate("/opportunities");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar oportunidade");
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizer: "",
    deadline: "",
    isRollingDeadline: false,
    opportunityType: "Fellowship" as string,
    stage: "Multi-stage" as string,
    regions: [] as string[],
    mode: "Online" as string,
    fields: [] as string[],
    funding: "Not certain" as string,
    fee: "No-fee" as string,
    requirements: "",
    benefits: "",
    programStartDate: "",
    programEndDate: "",
    fundingAmount: "",
    applicationLink: "",
    isFeatured: false,
  });

  useEffect(() => {
    if (!opportunity) return;
    const opp = opportunity as any;
    const regions = typeof opp.regions === 'string' ? JSON.parse(opp.regions) : (opp.regions ?? []);
    const fields = typeof opp.fields === 'string' ? JSON.parse(opp.fields) : (opp.fields ?? []);
    const deadlineStr = opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : '';
    const startStr = opp.programStartDate ? new Date(opp.programStartDate).toISOString().split('T')[0] : '';
    const endStr = opp.programEndDate ? new Date(opp.programEndDate).toISOString().split('T')[0] : '';

    setFormData({
      title: opp.title ?? "",
      description: opp.description ?? "",
      organizer: opp.organizer ?? "",
      deadline: deadlineStr,
      isRollingDeadline: !deadlineStr,
      opportunityType: opp.opportunityType ?? "Fellowship",
      stage: opp.stage ?? "Multi-stage",
      regions,
      mode: opp.mode ?? "Online",
      fields,
      funding: opp.funding ?? "Not certain",
      fee: opp.fee ?? "No-fee",
      requirements: opp.requirements ?? "",
      benefits: opp.benefits ?? "",
      programStartDate: startStr,
      programEndDate: endStr,
      fundingAmount: opp.fundingAmount ?? "",
      applicationLink: opp.applicationLink ?? "",
      isFeatured: opp.isFeatured ?? false,
    });
  }, [opportunity]);

  const toggleRegion = (region: string) =>
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region],
    }));

  const toggleField = (field: string) =>
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId) return;

    if (formData.regions.length === 0) {
      toast.error("Selecione ao menos uma região");
      return;
    }
    if (formData.fields.length === 0) {
      toast.error("Selecione ao menos uma área");
      return;
    }

    updateMutation.mutate({
      id: opportunityId,
      title: formData.title,
      description: formData.description || null,
      organizer: formData.organizer,
      deadline: formData.isRollingDeadline || !formData.deadline ? null : new Date(formData.deadline),
      opportunityType: formData.opportunityType,
      stage: formData.stage,
      regions: formData.regions,
      mode: formData.mode,
      fields: formData.fields,
      funding: formData.funding,
      fee: formData.fee,
      requirements: formData.requirements || null,
      benefits: formData.benefits || null,
      programStartDate: formData.programStartDate ? new Date(formData.programStartDate) : null,
      programEndDate: formData.programEndDate ? new Date(formData.programEndDate) : null,
      fundingAmount: formData.fundingAmount || null,
      applicationLink: formData.applicationLink || null,
      isFeatured: formData.isFeatured,
    });
  };

  if (authLoading || oppLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Apenas admins podem editar oportunidades.</p>
          <Link href="/"><Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Voltar</Button></Link>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Oportunidade não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <Link href="/opportunities" className="text-gray-600 hover:text-blue-600 transition flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Oportunidades
          </Link>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Pencil className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Editar Oportunidade</h1>
              <p className="text-gray-600 mt-1 line-clamp-1">{(opportunity as any).title}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Informações Básicas</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título *</label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organizador *</label>
                <Input value={formData.organizer} onChange={e => setFormData({ ...formData, organizer: e.target.value })} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da oportunidade..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prazo {!formData.isRollingDeadline && '*'}
                </label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  required={!formData.isRollingDeadline}
                  disabled={formData.isRollingDeadline}
                  className={formData.isRollingDeadline ? 'bg-gray-100' : ''}
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRollingDeadline}
                    onChange={e => setFormData({ ...formData, isRollingDeadline: e.target.checked, deadline: e.target.checked ? '' : formData.deadline })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-600">Prazo contínuo (sem data específica)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link de Inscrição</label>
                <Input
                  type="url"
                  value={formData.applicationLink}
                  onChange={e => setFormData({ ...formData, applicationLink: e.target.value })}
                  placeholder="https://example.com/apply"
                />
              </div>
            </div>

            {/* Classification */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Classificação</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.opportunityType} onChange={e => setFormData({ ...formData, opportunityType: e.target.value })} required>
                  {OPPORTUNITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estágio *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} required>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Modalidade *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })} required>
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Financiamento *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.funding} onChange={e => setFormData({ ...formData, funding: e.target.value })} required>
                  {FUNDING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Taxa *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.fee} onChange={e => setFormData({ ...formData, fee: e.target.value })} required>
                  {FEE_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Destaque na home
                </label>
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Regiões Elegíveis *</h2>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(region => (
                  <button key={region} type="button" onClick={() => toggleRegion(region)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.regions.includes(region) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {formData.regions.includes(region) && <Check className="w-4 h-4 inline mr-1" />}
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Áreas / Indústrias *</h2>
              <div className="flex flex-wrap gap-2">
                {FIELDS.map(field => (
                  <button key={field} type="button" onClick={() => toggleField(field)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.fields.includes(field) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {formData.fields.includes(field) && <Check className="w-4 h-4 inline mr-1" />}
                    {field}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Detalhes Adicionais</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Requisitos</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder="Requisitos de elegibilidade..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Benefícios</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })} placeholder="O que os participantes receberão..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor do Financiamento</label>
                <Input value={formData.fundingAmount} onChange={e => setFormData({ ...formData, fundingAmount: e.target.value })} placeholder="ex: $50,000 USD" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Início do Programa</label>
                  <Input type="date" value={formData.programStartDate} onChange={e => setFormData({ ...formData, programStartDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fim do Programa</label>
                  <Input type="date" value={formData.programEndDate} onChange={e => setFormData({ ...formData, programEndDate: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 border-t pt-6">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? "Salvando..." : (
                  <><Pencil className="w-5 h-5" /> Salvar Alterações</>
                )}
              </Button>
              <Link href="/opportunities">
                <Button type="button" variant="outline" className="px-6 py-3 rounded-lg">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
