import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Docs from "./pages/Docs";
import Marketplace from "./pages/Marketplace";
import About from "./pages/About";
import Auth from "./pages/auth/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <div className="h-full overflow-hidden">
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <OrganizationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="projects/:projectId/board" element={<Board />} />
                  <Route path="board" element={<Board />} /> {/* Fallback for default project */}
                  <Route path="docs" element={<Docs />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="about" element={<About />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
            </OrganizationProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </div>
);

export default App;
