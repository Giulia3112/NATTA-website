import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Search, MapPin, Calendar, DollarSign, ExternalLink, Pencil, Plus, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import AISearch from "@/components/AISearch";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const APPLICATION_STATUSES = [
  { value: "Considering", key: "considering" },
  { value: "Applied", key: "applied" },
  { value: "In Progress", key: "inProgress" },
  { value: "Accepted", key: "accepted" },
  { value: "Rejected", key: "rejected" },
  { value: "One Day", key: "oneDay" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  Considering: "bg-purple-100 text-purple-700 border-purple-200",
  Applied: "bg-blue-100 text-blue-700 border-blue-200",
  "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Accepted: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  "One Day": "bg-gray-100 text-gray-600 border-gray-200",
};

const OPPORTUNITY_TYPES = ["Scholarship", "Fellowship", "Accelerator", "Incubator", "Competition", "Internship", "Grant", "Conference", "Exchange Program", "Course", "Other"];
const STAGES = ["High school", "Undergraduate", "Graduate", "Startup idea", "MVP", "Revenue", "Scale", "Multi-stage", "Other"];
const REGIONS = ["Global", "Africa", "India", "Brazil", "LATAM", "Southeast Asia", "East Asia", "Middle East", "Europe", "USA/Canada", "Oceania"];
const MODES = ["Online", "In-person", "Hybrid"];
const FIELDS = [
  'Tech', 'Engineering', 'AI/ML', 'Blockchain', 'Data Science', 'Cybersecurity', 'Robotics',
  'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Astronomy', 'Geology', 'Environmental Science',
  'Health', 'Medicine', 'Nursing', 'Public Health', 'Pharmacy', 'Biotechnology', 'Neuroscience',
  'Psychology', 'Sociology', 'Anthropology', 'Economics', 'Political Science', 'Geography',
  'Literature', 'History', 'Philosophy', 'Languages', 'Arts', 'Music', 'Theater',
  'Business', 'Finance', 'Entrepreneurship', 'Marketing', 'Management',
  'Agriculture', 'Architecture', 'Urban Planning', 'Design',
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
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [addingOpp, setAddingOpp] = useState<{ id: number; title: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = user?.role === 'admin';
  const { t } = useTranslation();

  const createApplicationMutation = trpc.applications.create.useMutation({
    onSuccess: () => {
      toast.success(t("opportunities.toast.added"));
      setAddingOpp(null);
      setSelectedStatus("");
    },
    onError: (err) => {
      toast.error(err.message ?? t("opportunities.toast.error"));
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
              <span className="text-sm text-gray-500 hidden sm:block">
                {t("opportunities.hello")} {user.name?.split(" ")[0]}!
              </span>
              <Link href="/dashboard">
                <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  {t("nav.profile")}
                </Button>
              </Link>
            </div>
          )}
          {!user && (
            <Link href="/login">
              <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                {t("nav.signIn")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-2">{t("opportunities.title")}</h1>
        <p className="text-gray-600 mb-6">{t("opportunities.subtitle")}</p>

        {/* AI Search */}
        <AISearch />

        {/* Classic Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t("opportunities.searchPlaceholder")}
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
                <h3 className="font-bold text-lg">{t("opportunities.filters.title")}</h3>
                <button onClick={handleReset} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {t("opportunities.filters.clear")}
                </button>
              </div>

              {[
                { label: t("opportunities.filters.type"), value: selectedType, setter: setSelectedType, options: OPPORTUNITY_TYPES },
                { label: t("opportunities.filters.stage"), value: selectedStage, setter: setSelectedStage, options: STAGES },
                { label: t("opportunities.filters.region"), value: selectedRegion, setter: setSelectedRegion, options: REGIONS },
                { label: t("opportunities.filters.mode"), value: selectedMode, setter: setSelectedMode, options: MODES },
                { label: t("opportunities.filters.field"), value: selectedField, setter: setSelectedField, options: FIELDS },
                { label: t("opportunities.filters.funding"), value: selectedFunding, setter: setSelectedFunding, options: FUNDING_TYPES },
              ].map(({ label, value, setter, options }) => (
                <div key={label} className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-900">{label}</label>
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t("opportunities.filters.all")}</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6 text-sm text-gray-600">
              {t("opportunities.showing")} <span className="font-semibold">{opportunities.length}</span> {t("opportunities.opportunitiesCount")}
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
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 ease-in-out" title={t("opportunities.editOpportunity")}>
                              <Pencil className="w-4 h-4 text-blue-500" />
                            </button>
                          </Link>
                        )}
                        <button
                          onClick={() => handleAddToDashboard({ id: opp.id, title: opp.title })}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-300 ease-in-out"
                          title={t("opportunities.addToDashboard")}
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
                            {expandedCards.has(opp.id) ? t("opportunities.readLess") : t("opportunities.readMore")}
                          </button>
                        )}
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">
                          {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : t("opportunities.rollingBasis")}
                        </span>
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
                            {t("opportunities.visitSite")}
                          </Button>
                        </a>
                      ) : (
                        <Button disabled className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
                          {t("opportunities.linkUnavailable")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">{t("opportunities.noOpportunities")}</p>
                  <p className="text-gray-500 text-sm mt-2">{t("opportunities.adjustFilters")}</p>
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
              <h2 className="text-xl font-bold text-gray-900">{t("opportunities.modal.title")}</h2>
              <button
                onClick={() => { setAddingOpp(null); setSelectedStatus(""); }}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-blue-700 font-semibold mb-1 truncate">{addingOpp.title}</p>
            <p className="text-xs text-gray-500 mb-5">{t("opportunities.modal.whichStage")}</p>

            <div className="space-y-3 mb-6">
              {APPLICATION_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedStatus === s.value
                      ? STATUS_COLORS[s.value] + " border-current shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{t(`opportunities.modal.${s.key}.label`)}</p>
                    <p className="text-xs opacity-75">{t(`opportunities.modal.${s.key}.description`)}</p>
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
                {t("opportunities.modal.cancel")}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!selectedStatus || createApplicationMutation.isPending}
                onClick={handleConfirmStatus}
              >
                {createApplicationMutation.isPending ? t("opportunities.modal.adding") : t("opportunities.modal.add")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
