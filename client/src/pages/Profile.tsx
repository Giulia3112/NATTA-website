import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, LogOut, Save, X, Check, Bot, Sparkles, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const INTEREST_TAGS = [
  "Tech", "Business", "Climate", "Social Impact", "Health", "Policy",
  "Design", "Engineering", "Finance", "Education", "Agriculture", "Energy",
  "Transportation", "AI/ML", "Blockchain", "Sustainability",
];

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  interests: string[];
}

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    interests: (user?.interests as string[]) || [],
  });
  const [savedMessage, setSavedMessage] = useState(false);
  const { t } = useTranslation();

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("profile.profileUpdated"));
      setSavedMessage(true);
      setIsEditing(false);
      setTimeout(() => setSavedMessage(false), 3000);
    },
    onError: (error) => {
      toast.error(t("profile.failedUpdate") + error.message);
    },
  });

  const { data: applicationStats } = trpc.auth.applicationStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        interests: (user.interests as string[]) || [],
      });
    }
  }, [user]);

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
          <h1 className="text-3xl font-bold mb-4">{t("profile.accessRestricted")}</h1>
          <p className="text-gray-600 mb-6">{t("profile.needAuth")}</p>
          <Link href="/login">
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t("profile.loginBtn")}
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

  const stats = applicationStats || { total: 0, applied: 0, inProgress: 0, accepted: 0, rejected: 0 };

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
              {t("nav.dashboard")}
            </Link>
            {user?.role === 'admin' && user?.email === 'alvaresgiulia@gmail.com' && (
              <>
                <Link href="/admin/scraper" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
                  {t("nav.scraper")}
                </Link>
                <Link href="/admin/users" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out">
                  {t("nav.users")}
                </Link>
              </>
            )}
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-300 ease-in-out flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t("profile.signOut")}
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
                  {t("profile.editProfile")}
                </button>
              )}
            </div>

            {savedMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">{t("profile.profileUpdated")}</span>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t("profile.fullName")}</label>
                  <Input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t("profile.email")}</label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t("profile.bioLabel")}</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder={t("profile.bioPlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">{t("profile.interestsLabel")}</label>
                  <p className="text-sm text-gray-600 mb-4">{t("profile.interestsDesc")}</p>
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
                    {t("profile.saveChanges")}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 font-semibold"
                  >
                    <X className="w-5 h-5" />
                    {t("profile.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">{t("profile.bioLabel")}</p>
                  {profile.bio ? (
                    <p className="text-gray-900 mt-1">{profile.bio}</p>
                  ) : (
                    <p className="text-gray-400 mt-1 italic">{t("profile.bioEmpty")}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">{t("profile.interestsLabel")}</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("profile.founderTitle")}</h2>
                <p className="text-gray-800 leading-relaxed mb-4">
                  {t("profile.founderBody1", { name: profile.name })}
                </p>
                <p className="text-gray-800 leading-relaxed mb-4">
                  {t("profile.founderBody2", { interests: profile.interests.join(", ") })}
                </p>
                <p className="text-gray-800 leading-relaxed">
                  {t("profile.founderBody3")}
                </p>
                <p className="text-gray-700 font-semibold mt-4">{t("profile.founderSignature")}</p>
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
                    <h2 className="text-2xl font-bold text-gray-900">{t("profile.adminTitle")}</h2>
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {t("profile.adminAuthorized")}
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed mb-4">{t("profile.adminBody")}</p>
                  <div className="flex gap-4">
                    <Link href="/admin/scraper">
                      <Button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 ease-in-out flex items-center gap-2 font-semibold">
                        <Bot className="w-5 h-5" />
                        {t("profile.openScraper")}
                      </Button>
                    </Link>
                    <Link href="/admin/add-opportunity">
                      <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out flex items-center gap-2 font-semibold">
                        <Plus className="w-5 h-5" />
                        {t("profile.addManually")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("profile.statsTitle")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600 mt-1">{t("profile.statsTotal")}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-600">{stats.applied}</p>
                <p className="text-sm text-gray-600 mt-1">{t("profile.statsApplied")}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-600 mt-1">{t("profile.statsInProgress")}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                <p className="text-sm text-gray-600 mt-1">{t("profile.statsAccepted")}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-sm text-gray-600 mt-1">{t("profile.statsRejected")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
