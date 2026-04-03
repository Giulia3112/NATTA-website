import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar, LayoutGrid, X } from "lucide-react";

interface Application {
  id: string;
  opportunityTitle: string;
  organizer: string;
  deadline: Date;
  status: "Applied" | "In Progress" | "Accepted" | "Rejected";
  notes?: string;
  programStartDate?: Date;
  programEndDate?: Date;
}

const mockApplications: Application[] = [
  {
    id: "1",
    opportunityTitle: "Google Summer of Code 2026",
    organizer: "Google",
    deadline: new Date("2026-04-15"),
    status: "Applied",
    notes: "Awaiting response",
    programStartDate: new Date("2026-06-01"),
    programEndDate: new Date("2026-08-31"),
  },
  {
    id: "2",
    opportunityTitle: "Schwarzman Scholars Program",
    organizer: "Tsinghua University",
    deadline: new Date("2026-03-31"),
    status: "In Progress",
    notes: "Submitted for interview",
    programStartDate: new Date("2026-09-01"),
    programEndDate: new Date("2028-08-31"),
  },
  {
    id: "3",
    opportunityTitle: "Y Combinator Startup School",
    organizer: "Y Combinator",
    deadline: new Date("2026-05-30"),
    status: "Accepted",
    notes: "Confirmed! Starts in June",
    programStartDate: new Date("2026-06-15"),
    programEndDate: new Date("2026-09-15"),
  },
  {
    id: "4",
    opportunityTitle: "TechStars Accelerator",
    organizer: "TechStars",
    deadline: new Date("2026-04-30"),
    status: "Accepted",
    notes: "Accepted! Program in summer",
    programStartDate: new Date("2026-07-01"),
    programEndDate: new Date("2026-09-30"),
  },
];

const STATUSES = ["Applied", "In Progress", "Accepted", "Rejected"] as const;

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [viewMode, setViewMode] = useState<"kanban" | "calendar">("kanban");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    opportunityTitle: "",
    organizer: "",
    deadline: "",
    status: "Applied" as const,
    notes: "",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">You need to be authenticated to access the dashboard.</p>
          <Link href="/">
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getApplicationsByStatus = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  const handleStatusChange = (appId: string, newStatus: string) => {
    setApplications(
      applications.map((app) =>
        app.id === appId ? { ...app, status: newStatus as any } : app
      )
    );
  };

  const handleDeleteApplication = (appId: string) => {
    setApplications(applications.filter((app) => app.id !== appId));
  };

  const handleAddApplication = () => {
    if (!formData.opportunityTitle || !formData.organizer || !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    const newApplication: Application = {
      id: Date.now().toString(),
      opportunityTitle: formData.opportunityTitle,
      organizer: formData.organizer,
      deadline: new Date(formData.deadline),
      status: formData.status,
      notes: formData.notes,
    };

    setApplications([...applications, newApplication]);
    setFormData({
      opportunityTitle: "",
      organizer: "",
      deadline: "",
      status: "Applied",
      notes: "",
    });
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/natta-logo.png" alt="NATTA" className="h-8" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}!</span>
            <Link href="/profile">
              <Button variant="outline" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">Track all your applications in one place</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold transition-all duration-300 ease-in-out"
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
              viewMode === "kanban"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5" />
            Calendar
          </button>
        </div>

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STATUSES.map((status) => (
              <div key={status} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-900">
                  {status}
                  <span className="ml-2 text-sm text-gray-500">({getApplicationsByStatus(status).length})</span>
                </h3>
                <div className="space-y-3">
                  {getApplicationsByStatus(status).map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300 ease-in-out"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{app.opportunityTitle}</h4>
                      <p className="text-sm text-gray-600 mb-3">{app.organizer}</p>
                      <div className="text-xs text-gray-500 mb-3">
                        Deadline: {app.deadline.toLocaleDateString("en-US")}
                      </div>
                      {app.notes && <p className="text-sm text-gray-600 mb-3 italic">&quot;{app.notes}&quot;</p>}
                      <div className="flex gap-2">
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-all duration-300 ease-in-out"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {getApplicationsByStatus(status).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">No applications</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Program Timeline & Conflicts</h3>
            <div className="space-y-6">
              {applications
                .filter((app) => app.status === "Accepted" && app.programStartDate && app.programEndDate)
                .sort((a, b) => (a.programStartDate?.getTime() || 0) - (b.programStartDate?.getTime() || 0))
                .map((app) => {
                  // Check for conflicts with other accepted programs
                  const conflicts = applications.filter(
                    (other) =>
                      other.id !== app.id &&
                      other.status === "Accepted" &&
                      other.programStartDate &&
                      other.programEndDate &&
                      app.programStartDate &&
                      app.programEndDate &&
                      (
                        (app.programStartDate >= other.programStartDate && app.programStartDate <= other.programEndDate) ||
                        (app.programEndDate >= other.programStartDate && app.programEndDate <= other.programEndDate) ||
                        (app.programStartDate <= other.programStartDate && app.programEndDate >= other.programEndDate)
                      )
                  );

                  const hasConflict = conflicts.length > 0;

                  return (
                    <div key={app.id}>
                      <div
                        className={`p-6 rounded-lg border-2 transition-all duration-300 ease-in-out ${
                          hasConflict
                            ? "bg-red-50 border-red-300"
                            : "bg-green-50 border-green-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">{app.opportunityTitle}</h4>
                            <p className="text-sm text-gray-600 mb-2">{app.organizer}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="font-semibold text-gray-700">Start:</span>{" "}
                                <span className="text-gray-900">
                                  {app.programStartDate?.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">End:</span>{" "}
                                <span className="text-gray-900">
                                  {app.programEndDate?.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {hasConflict && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                              ⚠️ Conflict
                            </div>
                          )}
                        </div>

                        {/* Visual Timeline Bar */}
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full ${
                              hasConflict ? "bg-red-600" : "bg-green-600"
                            }`}
                            style={{ width: "100%" }}
                          />
                        </div>

                        {hasConflict && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                            <p className="font-semibold text-red-900 mb-2">⚠️ Date Conflict Detected</p>
                            <p className="text-sm text-red-800 mb-2">
                              This program overlaps with:
                            </p>
                            <ul className="text-sm text-red-800 space-y-1">
                              {conflicts.map((conflict) => (
                                <li key={conflict.id} className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-red-600 rounded-full" />
                                  <strong>{conflict.opportunityTitle}</strong>
                                  <span className="text-gray-600">
                                    ({conflict.programStartDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                                    {conflict.programEndDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {applications.filter((app) => app.status === "Accepted" && app.programStartDate && app.programEndDate).length === 0 && (
                <p className="text-gray-500 text-center py-8">No accepted programs with dates to display</p>
              )}
            </div>
          </div>
        )}

        {/* Conflict Detection Alert */}
        {applications.filter((a) => a.status === "Accepted").length > 1 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-yellow-900 mb-2">⚠️ Check for Date Conflicts</h3>
            <p className="text-yellow-800 text-sm">
              You have {applications.filter((a) => a.status === "Accepted").length} accepted opportunities. Check the calendar for any date conflicts.
            </p>
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Application</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-in-out"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Opportunity Title *</label>
                <Input
                  type="text"
                  value={formData.opportunityTitle}
                  onChange={(e) => setFormData({ ...formData, opportunityTitle: e.target.value })}
                  placeholder="e.g., Google Summer of Code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Organizer *</label>
                <Input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Deadline *</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this application..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddApplication}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all duration-300 ease-in-out"
                >
                  Add Application
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-300 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
