import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Calendar, DollarSign, ExternalLink, Pencil, Plus, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import AISearch from "@/components/AISearch";
import { toast } from "sonner";

const APPLICATION_STATUSES = [
  { value: "Considering", label: "Considering", description: "Estou pensando em aplicar", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "Applied", label: "Applied", description: "Já me candidatei", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "In Progress", label: "In Progress", description: "Estou preparando a candidatura", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "Accepted", label: "Accepted", description: "Fui aceito(a)!", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "Rejected", label: "Rejected", description: "Não fui selecionado(a)", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "One Day", label: "One Day", description: "Salvar para o futuro", color: "bg-gray-100 text-gray-600 border-gray-200" },
] as const;

const OPPORTUNITY_TYPES = ["Scholarship", "Fellowship", "Accelerator", "Incubator", "Competition", "Internship", "Grant", "Conference", "Exchange Program", "Course", "Other"];
const STAGES = ["High school", "Undergraduate", "Graduate", "Startup idea", "MVP", "Revenue", "Scale", "Multi-stage", "Other"];
const REGIONS = ["Global", "Africa", "India", "Brazil", "LATAM", "Southeast Asia", "East Asia", "Middle East", "Europe", "USA/Canada", "Oceania"];
const MODES = ["Online", "In-person", "Hybrid"];
const FIELDS = [
  // Technology & Engineering
  'Tech', 'Engineering', 'AI/ML', 'Blockchain', 'Data Science', 'Cybersecurity', 'Robotics',
  // Natural Sciences
  'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Astronomy', 'Geology', 'Environmental Science',
  // Life & Health Sciences
  'Health', 'Medicine', 'Nursing', 'Public Health', 'Pharmacy', 'Biotechnology', 'Neuroscience',
  // Social Sciences
  'Psychology', 'Sociology', 'Anthropology', 'Economics', 'Political Science', 'Geography',
  // Humanities & Arts
  'Literature', 'History', 'Philosophy', 'Languages', 'Arts', 'Music', 'Theater',
  // Business & Management
  'Business', 'Finance', 'Entrepreneurship', 'Marketing', 'Management',
  // Applied Sciences
  'Agriculture', 'Architecture', 'Urban Planning', 'Design',
  // Interdisciplinary
  'Climate', 'Sustainability', 'Energy', 'Transportation', 'Social Impact', 'Policy', 'Education', 'Law'
];
const FUNDING_TYPES = ["Fully funded", "Partial", "Stipend", "Equity-based", "Not certain"];

export default function Opportunities() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedFunding, setSelectedFunding] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [addingOpp, setAddingOpp] = useState<{ id: number; title: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = user?.role === 'admin';

  const createApplicationMutation = trpc.applications.create.useMutation({
    onSuccess: () => {
      toast.success("Oportunidade adicionada ao seu dashboard!");
      setAddingOpp(null);
      setSelectedStatus("");
    },
    onError: (err) => {
      toast.error(err.message ?? "Erro ao adicionar candidatura");
    },
  });

  const handleAddToDashboard = (opp: { id: number; title: string }) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedStatus("");
    setAddingOpp(opp);
  };

  const handleConfirmStatus = () => {
    if (!addingOpp || !selectedStatus) return;
    createApplicationMutation.mutate({
      opportunityId: addingOpp.id,
      status: selectedStatus as any,
    });
  };

  const toggleExpanded = (id: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const { data: opportunities = [] } = trpc.opportunities.list.useQuery({
    type: selectedType || undefined,
    stage: selectedStage || undefined,
    region: selectedRegion || undefined,
    mode: selectedMode || undefined,
    field: selectedField || undefined,
    funding: selectedFunding || undefined,
    search: search || undefined,
  });

  const handleReset = () => {
    setSearch("");
    setSelectedType("");
    setSelectedStage("");
    setSelectedRegion("");
    setSelectedMode("");
    setSelectedField("");
    setSelectedFunding("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">Olá, {user.name?.split(" ")[0]}!</span>
              <Link href="/dashboard">
                <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Perfil
                </Button>
              </Link>
            </div>
          )}
          {!user && (
            <Link href="/login">
              <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-2">Opportunities</h1>
        <p className="text-gray-600 mb-6">Find the perfect opportunity for you</p>

        {/* AI Search */}
        <AISearch />

        {/* Classic Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear
                </button>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900">Opportunity Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  {OPPORTUNITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900">Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900">Mode</label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  {MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900">Field</label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  {FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              {/* Funding Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-900">Funding</label>
                <select
                  value={selectedFunding}
                  onChange={(e) => setSelectedFunding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  {FUNDING_TYPES.map((funding) => (
                    <option key={funding} value={funding}>
                      {funding}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6 text-sm text-gray-600">
              Showing <span className="font-semibold">{opportunities.length}</span> opportunities
            </div>

            <div className="space-y-4">
              {opportunities.length > 0 ? (
                opportunities.map((opp: any) => (
                  <div
                    key={opp.id}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 ease-in-out"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                        <p className="text-gray-600 text-sm">{opp.organizer}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <Link href={`/admin/edit-opportunity/${opp.id}`}>
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 ease-in-out" title="Editar oportunidade">
                              <Pencil className="w-4 h-4 text-blue-500" />
                            </button>
                          </Link>
                        )}
                        <button
                          onClick={() => handleAddToDashboard({ id: opp.id, title: opp.title })}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 ease-in-out"
                          title="Adicionar às candidaturas"
                        >
                          <Plus className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </div>

                    {opp.description ? (
                      <div className="mb-4">
                        <p className={`text-gray-600 text-sm leading-relaxed ${!expandedCards.has(opp.id) ? "line-clamp-3" : ""}`}>
                          {opp.description}
                        </p>
                        {opp.description.length > 180 && (
                          <button
                            onClick={() => toggleExpanded(opp.id)}
                            className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700 transition-colors"
                          >
                            {expandedCards.has(opp.id) ? "Ler menos ↑" : "Ler mais ↓"}
                          </button>
                        )}
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{opp.deadline ? new Date(opp.deadline).toLocaleDateString("en-US") : "Rolling Basis"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{opp.mode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{opp.funding}{opp.fee ? ` • ${opp.fee}` : ""}</span>
                      </div>
                      <div className="text-sm">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {opp.opportunityType}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-4">
                      {opp.fields.slice(0, 3).map((field: string) => (
                        <span key={field} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {field}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {opp.applicationLink ? (
                        <a href={opp.applicationLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out font-semibold flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Visitar Site
                          </Button>
                        </a>
                      ) : (
                        <Button disabled className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
                          Link indisponível
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No opportunities found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Dashboard Modal */}
      {addingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Adicionar ao Dashboard</h2>
              <button
                onClick={() => { setAddingOpp(null); setSelectedStatus(""); }}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-blue-700 font-semibold mb-1 truncate">{addingOpp.title}</p>
            <p className="text-xs text-gray-500 mb-5">Em que estágio você está com essa oportunidade?</p>

            <div className="space-y-3 mb-6">
              {APPLICATION_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedStatus === s.value
                      ? s.color + " border-current shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs opacity-75">{s.description}</p>
                  </div>
                  {selectedStatus === s.value && (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setAddingOpp(null); setSelectedStatus(""); }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!selectedStatus || createApplicationMutation.isPending}
                onClick={handleConfirmStatus}
              >
                {createApplicationMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
