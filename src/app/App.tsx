import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Providers } from "./providers";
import Index from "@/pages/Index";
import MapPage from "@/pages/MapPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <Providers>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </Providers>
);

export default App;
