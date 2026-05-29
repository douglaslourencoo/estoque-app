import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Pedidos from "./pages/Pedidos";
import Movimentacoes from "./pages/Movimentacoes";

function Router() {
  return (
    <BrowserRouter basename="estoque-app">
      <Routes>
        <Route path={"/"} element={<Produtos />} />
        <Route path={"/produtos"} element={<Produtos />} />
        <Route path={"/estoque"} element={<Estoque />} />
        <Route path={"/pedidos"} element={<Pedidos />} />
        <Route path={"/movimentacoes"} element={<Movimentacoes />} />
        <Route path={"/404"} element={<NotFound />} />
        {/* Final fallback route */}
        <Route element={<NotFound />} />
      </Routes>
    </BrowserRouter>
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
