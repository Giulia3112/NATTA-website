import { createContext, useContext, type ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { useFirebaseAuth } from "@/contexts/AuthContext";

interface SavedOpportunitiesContextType {
  savedIds: Set<string>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  getSavedCount: () => number;
}

const SavedOpportunitiesContext = createContext<SavedOpportunitiesContextType | undefined>(undefined);

export function SavedOpportunitiesProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useFirebaseAuth();
  const utils = trpc.useUtils();

  const savedQuery = trpc.savedOpportunities.list.useQuery(undefined, {
    enabled: !!firebaseUser,
    staleTime: 1000 * 60,
  });

  const saveMutation = trpc.savedOpportunities.save.useMutation({
    onSuccess: () => utils.savedOpportunities.list.invalidate(),
  });

  const unsaveMutation = trpc.savedOpportunities.unsave.useMutation({
    onSuccess: () => utils.savedOpportunities.list.invalidate(),
  });

  const savedIds = new Set(
    (savedQuery.data ?? []).map(item => String(item.opportunityId))
  );

  const toggleSaved = (id: string) => {
    if (!firebaseUser) return;
    const numId = parseInt(id);
    if (isNaN(numId)) return;

    if (savedIds.has(id)) {
      unsaveMutation.mutate(numId);
    } else {
      saveMutation.mutate(numId);
    }
  };

  const isSaved = (id: string) => savedIds.has(id);
  const getSavedCount = () => savedIds.size;

  return (
    <SavedOpportunitiesContext.Provider value={{ savedIds, toggleSaved, isSaved, getSavedCount }}>
      {children}
    </SavedOpportunitiesContext.Provider>
  );
}

export function useSavedOpportunities() {
  const context = useContext(SavedOpportunitiesContext);
  if (!context) {
    throw new Error("useSavedOpportunities must be used within SavedOpportunitiesProvider");
  }
  return context;
}
