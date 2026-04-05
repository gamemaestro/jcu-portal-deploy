import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { AuthRoute } from "@/components/AuthRoute";
import { Nav } from "@/components/Nav";
import { GameHud } from "@/components/GameHud";

// Pages
import HomePage from "@/pages/HomePage";
import JoinPage from "@/pages/JoinPage";           // /join — legacy redirect
import OriginPage from "@/pages/OriginPage";       // /origin — new auth + onboarding
import UniversePage from "@/pages/UniversePage";  // /universe — new world hub
import BrowsePage from "@/pages/BrowsePage";
import AboutPage from "@/pages/AboutPage";
import CategoryPage from "@/pages/CategoryPage";
import ArchivesPage from "@/pages/ArchivesPage";  // /archives — storefront + content
import { StubPage } from "@/pages/StubPage";
import NotFound from "@/pages/not-found";

function AppContent() {
  return (
    <Router hook={useHashLocation}>
      <Nav />
      <GameHud />
      <Switch>
        {/* Public routes */}
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/browse" component={BrowsePage} />

        {/* Auth routes — /origin is the new entry point */}
        <Route path="/origin" component={OriginPage} />
        {/* Keep /join working for existing users (login only after onboarding) */}
        <Route path="/join" component={JoinPage} />

        {/* Content categories */}
        <Route path="/comedies">
          {() => <CategoryPage category="comedies" />}
        </Route>
        <Route path="/histories">
          {() => <CategoryPage category="histories" />}
        </Route>
        <Route path="/mysteries">
          {() => <CategoryPage category="mysteries" />}
        </Route>
        <Route path="/archives" component={ArchivesPage} />

        <Route path="/search">
          {() => <StubPage title="Search" note="The search is being built. Return soon." />}
        </Route>

        {/* Auth-required routes */}
        {/* /universe replaces /world */}
        <Route path="/universe">
          {() => (
            <AuthRoute>
              <UniversePage />
            </AuthRoute>
          )}
        </Route>
        {/* Legacy /world redirect */}
        <Route path="/world">
          {() => (
            <AuthRoute>
              <UniversePage />
            </AuthRoute>
          )}
        </Route>

        <Route path="/profile">
          {() => (
            <AuthRoute>
              <StubPage title="Profile" note="Your archetype. Your state. Your record. This space is being constructed. Return soon." />
            </AuthRoute>
          )}
        </Route>
        <Route path="/game">
          {() => (
            <AuthRoute>
              <StubPage title="The Game" note="The alchemical journey. Solid → Liquid → Gas → Plasma. This space is being constructed. Return soon." />
            </AuthRoute>
          )}
        </Route>
        <Route path="/society">
          {() => (
            <AuthRoute>
              <StubPage title="The Society" note="Gas state required to enter. This space is being constructed. Return soon." />
            </AuthRoute>
          )}
        </Route>
        <Route path="/society/hall">
          {() => <StubPage title="Hall of Stars" note="The stars who have completed the journey. This space is being constructed. Return soon." />}
        </Route>

        {/* Stub routes */}
        <Route path="/library">
          {() => <StubPage title="Library" note="Everything, organized. This space is being constructed. Return soon." />}
        </Route>

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
