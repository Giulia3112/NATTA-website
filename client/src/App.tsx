import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminScraper from "./pages/AdminScraper";
import AdminUsers from "./pages/AdminUsers";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SavedOpportunities from "./pages/SavedOpportunities";
import AddOpportunity from "./pages/AddOpportunity";
import EditOpportunity from "./pages/EditOpportunity";
import { useAuth } from "./_core/hooks/useAuth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/opportunities"}>
        {() => <ProtectedRoute component={Opportunities} />}
      </Route>
      <Route path={"/opportunities/:id"}>
        {() => <ProtectedRoute component={OpportunityDetail} />}
      </Route>
      <Route path={"/saved"} component={SavedOpportunities} />
      <Route path={"/about"} component={About} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/admin/scraper"} component={AdminScraper} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/add-opportunity"} component={AddOpportunity} />
      <Route path={"/admin/edit-opportunity/:id"} component={EditOpportunity} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
