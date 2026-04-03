import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Check, X, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminScraper() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  if (!authLoading && user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const utils = trpc.useUtils();
  const { data: pending, isLoading } = trpc.scraper.getPending.useQuery();
  
  // Check if user has scraper access
  const hasScraperAccess = user?.email === 'alvaresgiulia@gmail.com';
  
  const startScrapingMutation = trpc.scraper.startScraping.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.scraper.getPending.invalidate();
    },
    onError: (error) => {
      toast.error(`Scraping failed: ${error.message}`);
    },
  });

  const approveMutation = trpc.scraper.approve.useMutation({
    onSuccess: () => {
      toast.success("Opportunity approved and added to database");
      utils.scraper.getPending.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const rejectMutation = trpc.scraper.reject.useMutation({
    onSuccess: () => {
      toast.success("Opportunity rejected");
      utils.scraper.getPending.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  const approveAllMutation = trpc.scraper.approveAll.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.scraper.getPending.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to approve all: ${error.message}`);
    },
  });

  const clearPendingMutation = trpc.scraper.clearPending.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.scraper.getPending.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to clear: ${error.message}`);
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link href="/">
            <img 
              src="/natta-logo.png" 
              alt="NATTA" 
              className="h-8"
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/opportunities" className="text-gray-700 hover:text-primary transition-colors">
              Opportunities
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-gray-700 hover:text-primary transition-colors">
              Users
            </Link>
            <Link href="/profile">
              <Button variant="default">Profile</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Opportunity Scraper</h1>
          <p className="text-gray-600">Automatically discover and review opportunities from trusted sources</p>
        </div>

        {/* Access Restriction Notice */}
        {!hasScraperAccess && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <p className="text-amber-800">
                ⚠️ <strong>Restricted Access:</strong> Only alvaresgiulia@gmail.com can activate the scraper. 
                You can view pending opportunities but cannot start new scraping sessions.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => startScrapingMutation.mutate()}
            disabled={startScrapingMutation.isPending || !hasScraperAccess}
            size="lg"
          >
            {startScrapingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Scraping
              </>
            )}
          </Button>

          {pending && pending.length > 0 && (
            <>
              <Button
                onClick={() => approveAllMutation.mutate()}
                disabled={approveAllMutation.isPending}
                variant="outline"
              >
                {approveAllMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve All ({pending.length})
                  </>
                )}
              </Button>

              <Button
                onClick={() => clearPendingMutation.mutate()}
                disabled={clearPendingMutation.isPending}
                variant="destructive"
              >
                {clearPendingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Pending Opportunities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            Pending Review ({pending?.length || 0})
          </h2>

          {!pending || pending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No opportunities pending review. Click "Start Scraping" to discover new opportunities.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pending.map((opp) => (
                <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{opp.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {opp.organizer} • Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "Rolling Basis"}
                        </CardDescription>
                      </div>
                      <Badge variant={opp.confidence > 0.8 ? "default" : "secondary"}>
                        {Math.round(opp.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Type:</span> {opp.opportunityType}
                        </div>
                        <div>
                          <span className="font-semibold">Stage:</span> {opp.stage}
                        </div>
                        <div>
                          <span className="font-semibold">Mode:</span> {opp.mode}
                        </div>
                        <div>
                          <span className="font-semibold">Funding:</span> {opp.funding}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {opp.regions.map((region) => (
                          <Badge key={region} variant="outline">
                            {region}
                          </Badge>
                        ))}
                        {opp.fields.map((field) => (
                          <Badge key={field} variant="secondary">
                            {field}
                          </Badge>
                        ))}
                      </div>

                      {/* Description */}
                      {opp.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{opp.description}</p>
                      )}

                      {/* Source URL */}
                      <a
                        href={opp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View source →
                      </a>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => approveMutation.mutate({ id: opp.id })}
                          disabled={approveMutation.isPending}
                          size="sm"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectMutation.mutate({ id: opp.id })}
                          disabled={rejectMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
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
