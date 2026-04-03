import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SavedOpportunitiesContextType {
  savedIds: Set<string>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  getSavedCount: () => number;
}

const SavedOpportunitiesContext = createContext<SavedOpportunitiesContextType | undefined>(undefined);

export function SavedOpportunitiesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("aiply_saved_opportunities");
    if (stored) {
      try {
        setSavedIds(new Set(JSON.parse(stored)));
      } catch (error) {
        console.error("Failed to load saved opportunities:", error);
      }
    }
  }, []);

  // Save to localStorage whenever savedIds changes
  useEffect(() => {
    localStorage.setItem("aiply_saved_opportunities", JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
