import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, LogOut, Save, X, Check, Bot, Sparkles, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const INTEREST_TAGS = [
  "Tech",
  "Business",
  "Climate",
  "Social Impact",
  "Health",
  "Policy",
  "Design",
  "Engineering",
  "Finance",
  "Education",
  "Agriculture",
  "Energy",
  "Transportation",
  "AI/ML",
  "Blockchain",
  "Sustainability",
];

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  interests: string[];
}

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "Passionate about discovering global opportunities and building my future",
    interests: (user?.interests as string[]) || ["Tech", "Business"],
  });
  const [savedMessage, setSavedMessage] = useState(false);

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setSavedMessage(true);
      setIsEditing(false);
      setTimeout(() => setSavedMessage(false), 3000);
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const { data: applicationStats } = trpc.auth.applicationStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Update profile state when user data changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "Passionate about discovering global opportunities and building my future",
        interests: (user.interests as string[]) || ["Tech", "Business"],
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">You need to be authenticated to access your profile.</p>
          <Link href="/">
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      bio: profile.bio,
      interests: profile.interests,
    });
  };

  const toggleInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const stats = applicationStats || {
    total: 0,
    applied: 0,
    inProgress: 0,
    accepted: 0,
    rejected: 0,
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
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
              Dashboard
            </Link>
            {user?.role === 'admin' && user?.email === 'alvaresgiulia@gmail.com' && (
              <>
                <Link href="/admin/scraper" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
                  Scraper
                </Link>
                <Link href="/admin/users" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
                  Users
                </Link>
              </>
            )}
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-300 ease-in-out flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Success Message */}
            {savedMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Profile updated successfully!</span>
              </div>
            )}

            {/* Edit Mode */}
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Tell us about yourself and what you're looking for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Your Interests</label>
                  <p className="text-sm text-gray-600 mb-4">Select the areas that interest you. We'll use this to send you personalized opportunities.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INTEREST_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out border-2 ${
                          profile.interests.includes(tag)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 font-semibold"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Bio</p>
                  <p className="text-gray-900 mt-1">{profile.bio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Your Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span key={interest} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CEO Message */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">A Message from Our Founder</h2>
                <p className="text-gray-800 leading-relaxed mb-4">
                  Hi {profile.name}! I'm the CEO and founder of NATTA, and I'm actively using this platform just like you. I personally review user profiles and send curated opportunities based on your interests and background.
                </p>
                <p className="text-gray-800 leading-relaxed mb-4">
                  Your interests in <strong>{profile.interests.join(", ")}</strong> are exactly what I look for when matching candidates with opportunities. The more detailed your profile, the better I can find the perfect fit for you.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  Keep your profile updated, and watch for personalized opportunities from me. I'm committed to helping ambitious candidates like you discover life-changing opportunities around the world.
                </p>
                <p className="text-gray-700 font-semibold mt-4">— The NATTA Team</p>
              </div>
            </div>
          </div>

          {/* Admin Scraper Access */}
          {user?.role === 'admin' && user?.email === 'alvaresgiulia@gmail.com' && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <Bot className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">AI Scraper Admin</h2>
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AUTHORIZED
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    You have exclusive access to the AI-powered opportunity scraper. Automatically discover and collect opportunities from 8 trusted sources worldwide.
                  </p>
                  <div className="flex gap-4">
                    <Link href="/admin/scraper">
                      <Button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 ease-in-out flex items-center gap-2 font-semibold">
                        <Bot className="w-5 h-5" />
                        Open AI Scraper Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/add-opportunity">
                      <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out flex items-center gap-2 font-semibold">
                        <Plus className="w-5 h-5" />
                        Add Opportunity Manually
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Application Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total Applications</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-600">{stats.applied}</p>
                <p className="text-sm text-gray-600 mt-1">Applied</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-600 mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                <p className="text-sm text-gray-600 mt-1">Accepted</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-gray-600 mt-1">Rejected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
