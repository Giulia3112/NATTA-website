import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Calendar, MapPin, DollarSign, Users, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { useSavedOpportunities } from "@/contexts/SavedOpportunitiesContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function OpportunityDetail() {
  const [, params] = useRoute("/opportunities/:id");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { isSaved, toggleSaved } = useSavedOpportunities();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const deleteOpportunityMutation = trpc.opportunities.delete.useMutation();

  const opportunityId = params?.id ? parseInt(params.id) : null;

  const opportunityQuery = trpc.opportunities.getById.useQuery(opportunityId!, {
    enabled: !!opportunityId,
  });

  const opportunity = opportunityQuery.data;

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
          <h1 className="text-3xl font-bold mb-4">Oportunidade não encontrada</h1>
          <p className="text-gray-600 mb-6">Esta oportunidade não existe ou foi removida.</p>
          <Link href="/opportunities">
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Voltar para Oportunidades
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    setShowApplicationModal(true);
  };

  const handleSave = () => {
    toggleSaved(opportunity.id.toString());
    toast.success(isSaved(opportunity.id.toString()) ? "Removed from saved" : "Saved to your collection");
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteOpportunityMutation.mutateAsync(opportunity.id);
      toast.success('Opportunity deleted successfully');
      navigate('/opportunities');
    } catch (error) {
      toast.error('Failed to delete opportunity');
      console.error(error);
    }
  };

  const canDelete = user?.role === 'admin' && user?.email === 'alvaresgiulia@gmail.com';

  const relatedQuery = trpc.opportunities.list.useQuery(
    { type: (opportunity as any).opportunityType },
    { enabled: !!(opportunity as any).opportunityType }
  );
  const relatedOpportunities = (relatedQuery.data ?? [])
    .filter((opp: any) => opp.id !== opportunity.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/opportunities" className="flex items-center gap-2 hover:text-blue-600 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="p-2 hover:bg-red-50 rounded-lg transition-all duration-300 ease-in-out"
            >
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
                    <span className="text-sm font-semibold text-gray-900">Deadline</span>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString("en-US") : "Rolling Basis"}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">Funding</span>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.funding}</p>
                  {opportunity.fee && (
                    <p className="text-xs text-gray-500 mt-1">{opportunity.fee}</p>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">Mode</span>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.mode}</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-900">Stage</span>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.stage}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {opportunity.opportunityType}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {opportunity.regions[0]}
                  </span>
                {opportunity.fields.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements & Eligibility</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Academic Background</h3>
                    <p className="text-gray-600">Currently enrolled or graduated from {opportunity.stage} level</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Geographic Eligibility</h3>
                    <p className="text-gray-600">Open to candidates from {opportunity.regions.join(", ")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Field of Study</h3>
                    <p className="text-gray-600">Preferably in {opportunity.fields.slice(0, 2).join(", ")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Language Requirements</h3>
                    <p className="text-gray-600">English proficiency (TOEFL/IELTS or equivalent)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Process */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Process</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Create Your Profile</h3>
                    <p className="text-gray-600">Sign up and complete your NATTA profile with your academic and professional information</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Prepare Your Application</h3>
                    <p className="text-gray-600">Gather required documents: CV, cover letter, transcripts, and recommendation letters</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Submit Application</h3>
                    <p className="text-gray-600">Complete the application form on the official website before the deadline</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Interview & Selection</h3>
                    <p className="text-gray-600">Selected candidates will be invited for interviews. Results announced within 4-6 weeks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Important Notes</h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Application deadline: {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString("en-US") : "Rolling Basis"}</li>
                    <li>• Late submissions will not be accepted</li>
                    <li>• All documents must be in English or officially translated</li>
                    <li>• Shortlisted candidates will be notified via email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Application Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ready to Apply?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start your application journey with NATTA. Track your progress and get personalized feedback.
              </p>
              <Button
                onClick={handleApply}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mb-3 transition-all duration-300 ease-in-out"
              >
                Apply Now
              </Button>
              <Button
                onClick={handleSave}
                variant="outline"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-300 ease-in-out"
              >
                {isSaved(opportunity.id.toString()) ? "✓ Saved" : "Save for Later"}
              </Button>
              {canDelete && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  disabled={deleteOpportunityMutation.isPending}
                  className="w-full px-4 py-3 mt-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-all duration-300 ease-in-out"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteOpportunityMutation.isPending ? 'Deleting...' : 'Delete Opportunity'}
                </Button>
              )}
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Opportunity Type</p>
                  <p className="text-gray-900 font-semibold">{opportunity.opportunityType}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Funding Type</p>
                  <p className="text-gray-900 font-semibold">{opportunity.funding}</p>
                </div>
                {opportunity.fee && (
                  <div>
                    <p className="text-gray-600 font-medium">Participation Fee</p>
                    <p className="text-gray-900 font-semibold">{opportunity.fee}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 font-medium">Application Mode</p>
                  <p className="text-gray-900 font-semibold">{opportunity.mode}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Target Stage</p>
                  <p className="text-gray-900 font-semibold">{opportunity.stage}</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Opportunity</h3>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Opportunities */}
        {relatedOpportunities.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedOpportunities.map((opp: any) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer h-full">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{opp.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{opp.organizer}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString("en-US") : "Rolling Basis"}
                    </div>
                    <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {opp.opportunityType}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {opp.regions[0]}
                    </span>
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
