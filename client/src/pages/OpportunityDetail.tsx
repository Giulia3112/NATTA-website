import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Calendar, MapPin, DollarSign, Users, CheckCircle, AlertCircle, Trash2, X } from "lucide-react";
import { useSavedOpportunities } from "@/contexts/SavedOpportunitiesContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export default function OpportunityDetail() {
  const [, params] = useRoute("/opportunities/:id");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { isSaved, toggleSaved } = useSavedOpportunities();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const deleteOpportunityMutation = trpc.opportunities.delete.useMutation();
  const { t } = useTranslation();

  const opportunityId = params?.id ? parseInt(params.id) : null;
  const [applicationNotes, setApplicationNotes] = useState("");

  const opportunityQuery = trpc.opportunities.getById.useQuery(opportunityId!, {
    enabled: !!opportunityId,
  });

  const createApplicationMutation = trpc.applications.create.useMutation({
    onSuccess: () => {
      toast.success(t("opportunityDetail.toast.added"));
      setShowApplicationModal(false);
      setApplicationNotes("");
    },
    onError: (err) => {
      toast.error(err.message ?? t("opportunityDetail.toast.error"));
    },
  });

  const opportunity = opportunityQuery.data;

  const relatedQuery = trpc.opportunities.list.useQuery(
    { type: (opportunity as any)?.opportunityType },
    { enabled: !!(opportunity as any)?.opportunityType }
  );
  const relatedOpportunities = (relatedQuery.data ?? [])
    .filter((opp: any) => opp.id !== opportunity?.id)
    .slice(0, 3);

  if (opportunityQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t("opportunityDetail.notFoundTitle")}</h1>
          <p className="text-gray-600 mb-6">{t("opportunityDetail.notFoundBody")}</p>
          <Link href="/opportunities">
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t("opportunityDetail.notFoundBtn")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (!user) { navigate("/login"); return; }
    setShowApplicationModal(true);
  };

  const handleSave = () => {
    toggleSaved(opportunity.id.toString());
    toast.success(
      isSaved(opportunity.id.toString())
        ? t("opportunityDetail.toast.removed")
        : t("opportunityDetail.toast.saved")
    );
  };

  const handleDelete = async () => {
    if (!confirm(t("opportunityDetail.confirmDelete"))) return;
    try {
      await deleteOpportunityMutation.mutateAsync(opportunity.id);
      toast.success(t("opportunityDetail.toast.deleted"));
      navigate('/opportunities');
    } catch {
      toast.error(t("opportunityDetail.toast.deleteFailed"));
    }
  };

  const canDelete = user?.role === 'admin' && user?.email === 'alvaresgiulia@gmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/opportunities" className="flex items-center gap-2 hover:text-blue-600 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{t("opportunityDetail.back")}</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 ease-in-out">
              <Heart className={`w-5 h-5 transition-all duration-300 ease-in-out ${
                isSaved(opportunity.id.toString()) ? "text-red-600 fill-red-600" : "text-gray-400"
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{opportunity.title}</h1>
                  <p className="text-xl text-gray-600">{opportunity.organizer}</p>
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-6">{opportunity.description}</p>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">{t("opportunityDetail.deadline")}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : t("opportunityDetail.rollingBasis")}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">{t("opportunityDetail.funding")}</span>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.funding}</p>
                  {opportunity.fee && <p className="text-xs text-gray-500 mt-1">{opportunity.fee}</p>}
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">{t("opportunityDetail.mode")}</span>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.mode}</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-900">{t("opportunityDetail.stage")}</span>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.stage}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{opportunity.opportunityType}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{opportunity.regions[0]}</span>
                {opportunity.fields.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("opportunityDetail.requirementsTitle")}</h2>
              <div className="space-y-4">
                {[
                  { title: t("opportunityDetail.academicTitle"), body: t("opportunityDetail.academicBody", { stage: opportunity.stage }) },
                  { title: t("opportunityDetail.geographicTitle"), body: t("opportunityDetail.geographicBody", { regions: opportunity.regions.join(", ") }) },
                  { title: t("opportunityDetail.fieldTitle"), body: t("opportunityDetail.fieldBody", { fields: opportunity.fields.slice(0, 2).join(", ") }) },
                  { title: t("opportunityDetail.languageTitle"), body: t("opportunityDetail.languageBody") },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Process */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("opportunityDetail.processTitle")}</h2>
              <div className="space-y-6">
                {([1, 2, 3, 4] as const).map((n) => (
                  <div key={n} className="flex gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">{n}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{t(`opportunityDetail.step${n}Title`)}</h3>
                      <p className="text-gray-600">{t(`opportunityDetail.step${n}Body`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">{t("opportunityDetail.importantTitle")}</h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• {t("opportunityDetail.importantNote1", { deadline: opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : t("opportunityDetail.rollingBasis") })}</li>
                    <li>• {t("opportunityDetail.importantNote2")}</li>
                    <li>• {t("opportunityDetail.importantNote3")}</li>
                    <li>• {t("opportunityDetail.importantNote4")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Application Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("opportunityDetail.readyTitle")}</h3>
              <p className="text-sm text-gray-600 mb-4">{t("opportunityDetail.readyBody")}</p>
              <Button
                onClick={handleApply}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mb-3 transition-all duration-300 ease-in-out"
              >
                {t("opportunityDetail.applyBtn")}
              </Button>
              <Button
                onClick={handleSave}
                variant="outline"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-300 ease-in-out"
              >
                {isSaved(opportunity.id.toString()) ? t("opportunityDetail.savedBtn") : t("opportunityDetail.saveBtn")}
              </Button>
              {canDelete && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  disabled={deleteOpportunityMutation.isPending}
                  className="w-full px-4 py-3 mt-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-all duration-300 ease-in-out"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteOpportunityMutation.isPending ? t("opportunityDetail.deleting") : t("opportunityDetail.deleteBtn")}
                </Button>
              )}
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("opportunityDetail.factsTitle")}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">{t("opportunityDetail.factType")}</p>
                  <p className="text-gray-900 font-semibold">{opportunity.opportunityType}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">{t("opportunityDetail.factFunding")}</p>
                  <p className="text-gray-900 font-semibold">{opportunity.funding}</p>
                </div>
                {opportunity.fee && (
                  <div>
                    <p className="text-gray-600 font-medium">{t("opportunityDetail.factFee")}</p>
                    <p className="text-gray-900 font-semibold">{opportunity.fee}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 font-medium">{t("opportunityDetail.factMode")}</p>
                  <p className="text-gray-900 font-semibold">{opportunity.mode}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">{t("opportunityDetail.factStage")}</p>
                  <p className="text-gray-900 font-semibold">{opportunity.stage}</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("opportunityDetail.shareTitle")}</h3>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  {t("opportunityDetail.shareBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t("opportunityDetail.applyModalTitle")}</h2>
                <button
                  onClick={() => { setShowApplicationModal(false); setApplicationNotes(""); }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">{opportunity.title}</p>
              <p className="text-xs text-gray-400 mb-4">{opportunity.organizer}</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("opportunityDetail.notesLabel")}
              </label>
              <textarea
                value={applicationNotes}
                onChange={(e) => setApplicationNotes(e.target.value)}
                placeholder={t("opportunityDetail.notesPlaceholder")}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-5"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowApplicationModal(false); setApplicationNotes(""); }}
                >
                  {t("opportunityDetail.cancel")}
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createApplicationMutation.isPending}
                  onClick={() =>
                    createApplicationMutation.mutate({
                      opportunityId: opportunity.id,
                      notes: applicationNotes || undefined,
                    })
                  }
                >
                  {createApplicationMutation.isPending ? t("opportunityDetail.adding") : t("opportunityDetail.add")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Related Opportunities */}
        {relatedOpportunities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("opportunityDetail.relatedTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedOpportunities.map((opp: any) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer h-full">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{opp.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{opp.organizer}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : t("opportunityDetail.rollingBasis")}
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{opp.opportunityType}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">{opp.regions[0]}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
