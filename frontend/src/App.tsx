import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import { KanbanBoardSkeleton } from "./components/KanbanBoardSkeleton";
import Index from "./pages/index";
import { useEffect, useState } from "react";
import { guestSession } from "./lib/auth";
import { api } from "./lib/api";
const queryClient = new QueryClient();

const App = () => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initApp() {
      try{
        await guestSession();
        await api.post("/boards/default");
      } catch(err) {
        console.log(err)
      }finally {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  if(loading) {
    return <KanbanBoardSkeleton />
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>)
};

export default App;