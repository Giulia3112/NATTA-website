import { useSavedOpportunities } from "@/contexts/SavedOpportunitiesContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";

export default function SavedOpportunities() {
  const { user, isAuthenticated, loading } = useAuth();
  const { savedIds, toggleSaved } = useSavedOpportunities();

  const opportunitiesQuery = trpc.opportunities.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const savedOpportunities = (opportunitiesQuery.data ?? []).filter(
    (opp: any) => savedIds.has(String(opp.id))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">You need to be authenticated to access saved opportunities.</p>
          <Link href="/login">
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/opportunities" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
              Opportunities
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
              Dashboard
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-600 fill-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">Saved Opportunities</h1>
          </div>
          <p className="text-gray-600">
            {savedOpportunities.length} {savedOpportunities.length === 1 ? "opportunity" : "opportunities"} saved
          </p>
        </div>

        {/* Empty State */}
        {savedOpportunities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Opportunities Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring opportunities and save your favorites for later. Click the heart icon to save any opportunity.
            </p>
            <Link href="/opportunities">
              <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                Explore Opportunities
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOpportunities.map((opportunity: any) => (
              <div
                key={opportunity.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600">{opportunity.organizer}</p>
                  </div>
                  <button
                    onClick={() => toggleSaved(opportunity.id)}
                    className="ml-2 p-2 hover:bg-red-50 rounded-lg transition-all duration-300 ease-in-out"
                  >
                    <Heart className="w-5 h-5 text-red-600 fill-red-600" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {opportunity.type}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {opportunity.stage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Region:</strong> {opportunity.region}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Deadline:</strong> {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString("en-US") : "Rolling Basis"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Funding:</strong> {opportunity.fundingType}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {opportunity.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {opportunity.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{opportunity.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link href="/dashboard">
                  <Button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all duration-300 ease-in-out">
                    Apply Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
