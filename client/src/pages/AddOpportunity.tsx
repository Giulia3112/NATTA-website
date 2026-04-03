import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const OPPORTUNITY_TYPES = ['Scholarship', 'Fellowship', 'Accelerator', 'Incubator', 'Competition', 'Internship', 'Grant', 'Conference', 'Exchange Program'];
const STAGES = ['High school', 'Undergraduate', 'Graduate', 'Startup idea', 'MVP', 'Revenue', 'Scale', 'Multi-stage'];
const MODES = ['Online', 'In-person', 'Hybrid'];
const FUNDING_TYPES = ['Fully funded', 'Partial', 'Stipend', 'Equity-based', 'Not certain'];
const FEE_TYPES = ['No-fee', 'Paid'];
const REGIONS = ['Global', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'India', 'Brazil', 'USA', 'UK', 'Canada', 'Australia'];
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

export default function AddOpportunity() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizer: "",
    deadline: "",
    isRollingDeadline: false,
    opportunityType: "Scholarship" as typeof OPPORTUNITY_TYPES[number],
    stage: "Undergraduate" as typeof STAGES[number],
    regions: [] as string[],
    mode: "Online" as typeof MODES[number],
    fields: [] as string[],
    funding: "Fully funded" as typeof FUNDING_TYPES[number],
    fee: "No-fee" as typeof FEE_TYPES[number],
    requirements: "",
    benefits: "",
    programStartDate: "",
    programEndDate: "",
    fundingAmount: "",
    applicationLink: "",
  });

  const createMutation = trpc.scraper.createManual.useMutation({
    onSuccess: () => {
      toast.success("Opportunity created successfully!");
      setLocation("/profile");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create opportunity");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Only admins can add opportunities manually.</p>
          <Link href="/">
            <Button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.regions.length === 0) {
      toast.error("Please select at least one region");
      return;
    }

    if (formData.fields.length === 0) {
      toast.error("Please select at least one field");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      organizer: formData.organizer,
      deadline: formData.isRollingDeadline ? null : new Date(formData.deadline),
      opportunityType: formData.opportunityType as any,
      stage: formData.stage as any,
      regions: formData.regions,
      mode: formData.mode as any,
      fields: formData.fields,
      funding: formData.funding as any,
      fee: formData.fee as any,
      requirements: formData.requirements || undefined,
      benefits: formData.benefits || undefined,
      programStartDate: formData.programStartDate ? new Date(formData.programStartDate) : undefined,
      programEndDate: formData.programEndDate ? new Date(formData.programEndDate) : undefined,
      fundingAmount: formData.fundingAmount || undefined,
      applicationLink: formData.applicationLink || undefined,
    });
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region],
    }));
  };

  const toggleField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field],
    }));
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
            <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition-all duration-300 ease-in-out flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Add New Opportunity</h1>
              <p className="text-gray-600 mt-1">Manually add an opportunity to the catalog</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Fulbright Scholarship 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organizer *</label>
                <Input
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="e.g., Fulbright Commission"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the opportunity..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline {!formData.isRollingDeadline && '*'}</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required={!formData.isRollingDeadline}
                  disabled={formData.isRollingDeadline}
                  className={formData.isRollingDeadline ? 'bg-gray-100' : ''}
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRollingDeadline}
                    onChange={(e) => setFormData({ ...formData, isRollingDeadline: e.target.checked, deadline: e.target.checked ? '' : formData.deadline })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Rolling deadline (no specific date)</span>
                </label>
              </div>
            </div>

            {/* Classification */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Classification</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Opportunity Type *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.opportunityType}
                  onChange={(e) => setFormData({ ...formData, opportunityType: e.target.value as typeof OPPORTUNITY_TYPES[number] })}
                  required
                >
                  {OPPORTUNITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stage *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as typeof STAGES[number] })}
                  required
                >
                  {STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mode *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as typeof MODES[number] })}
                  required
                >
                  {MODES.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Funding Type *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.funding}
                  onChange={(e) => setFormData({ ...formData, funding: e.target.value as typeof FUNDING_TYPES[number] })}
                  required
                >
                  {FUNDING_TYPES.map(funding => (
                    <option key={funding} value={funding}>{funding}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Participation Fee *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value as typeof FEE_TYPES[number] })}
                  required
                >
                  {FEE_TYPES.map(fee => (
                    <option key={fee} value={fee}>{fee}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Eligible Regions *</h2>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(region => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                      formData.regions.includes(region)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formData.regions.includes(region) && <Check className="w-4 h-4 inline mr-1" />}
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Fields/Industries *</h2>
              <div className="flex flex-wrap gap-2">
                {FIELDS.map(field => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => toggleField(field)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
                      formData.fields.includes(field)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formData.fields.includes(field) && <Check className="w-4 h-4 inline mr-1" />}
                    {field}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900">Additional Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Eligibility requirements..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Benefits</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="What participants will receive..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Funding Amount</label>
                <Input
                  value={formData.fundingAmount}
                  onChange={(e) => setFormData({ ...formData, fundingAmount: e.target.value })}
                  placeholder="e.g., $50,000 USD"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Application Link</label>
                <Input
                  type="url"
                  value={formData.applicationLink}
                  onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                  placeholder="https://example.com/apply"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Program Start Date</label>
                  <Input
                    type="date"
                    value={formData.programStartDate}
                    onChange={(e) => setFormData({ ...formData, programStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Program End Date</label>
                  <Input
                    type="date"
                    value={formData.programEndDate}
                    onChange={(e) => setFormData({ ...formData, programEndDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 border-t pt-6">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 font-semibold"
              >
                {createMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Opportunity
                  </>
                )}
              </Button>
              <Link href="/profile">
                <Button
                  type="button"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 ease-in-out"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
