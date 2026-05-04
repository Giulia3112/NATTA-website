import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Send, 
  Search, 
  CheckSquare, 
  Square,
  Bell,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AdminUsers() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState("");

  // Check admin access first
  const hasAdminAccess = user?.role === 'admin' && user?.email === 'alvaresgiulia@gmail.com';

  const { data: users, isLoading: usersLoading } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: hasAdminAccess,
  });

  const { data: opportunities } = trpc.opportunities.list.useQuery({
    search: "",
    type: "",
    stage: "",
    region: "",
    mode: "",
    field: "",
    funding: "",
  }, {
    enabled: hasAdminAccess,
  });

  const sendNotificationMutation = trpc.admin.sendNotification.useMutation({
    onSuccess: (data) => {
      const parts = [`Email sent to ${data.sentCount} user(s).`];
      if (data.skippedNoEmail && data.skippedNoEmail > 0) {
        parts.push(`${data.skippedNoEmail} skipped (no email on file).`);
      }
      if (data.errors?.length) {
        parts.push(`Some failed: ${data.errors.join("; ")}`);
        toast.warning(parts.join(" "));
      } else {
        toast.success(parts.join(" "));
      }
      setShowNotificationModal(false);
      setSelectedUsers([]);
      setSelectedOpportunityId(null);
      setCustomMessage("");
    },
    onError: (error) => {
      toast.error(`Failed to send notification: ${error.message}`);
    },
  });

  const searchLower = searchTerm.toLowerCase();
  const filteredUsers =
    users?.filter((u) => {
      const name = (u.name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower);
    }) ?? [];

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSendNotification = () => {
    if (!selectedOpportunityId) {
      toast.error("Please select an opportunity");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    sendNotificationMutation.mutate({
      userIds: selectedUsers,
      opportunityId: selectedOpportunityId,
      message: customMessage || undefined,
    });
  };

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <Link href="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">Manage users and send early access notifications</p>
              </div>
            </div>
            <Link href="/admin/scraper">
              <Button variant="outline">Back to Scraper</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">{users?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Selected Users</p>
            <p className="text-3xl font-bold text-green-600">{selectedUsers.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Available Opportunities</p>
            <p className="text-3xl font-bold text-purple-600">{opportunities?.length || 0}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={selectAllUsers}
                className="flex-1 md:flex-none"
              >
                {selectedUsers.length === filteredUsers.length ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowNotificationModal(true)}
                disabled={selectedUsers.length === 0}
                className="flex-1 md:flex-none"
              >
                <Bell className="w-4 h-4 mr-2" />
                Send Notification ({selectedUsers.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserSelection(user.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {selectedUsers.includes(user.id) ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name ?? "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email ?? "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(user.interests as string[] || []).slice(0, 3).map((interest, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {interest}
                            </span>
                          ))}
                          {(user.interests as string[] || []).length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{(user.interests as string[]).length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Send Early Access Notification</h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Opportunity *
                </label>
                <select
                  value={selectedOpportunityId || ""}
                  onChange={(e) => setSelectedOpportunityId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an opportunity...</option>
                  {opportunities?.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} - {opp.organizer}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message from you as the founder... (Leave empty for default message)"
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: "New opportunity from NATTA Founder: [Opportunity Title]. Check it out on the platform!"
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Recipients:</strong> {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNotificationModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={!selectedOpportunityId || selectedUsers.length === 0 || sendNotificationMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {sendNotificationMutation.isPending ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
