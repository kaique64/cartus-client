import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SearchScreen } from "@/features/search/components/SearchScreen";
import { buildMapUrl } from "@/lib/url";
import type { SearchResult } from "@/features/search/types";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (result: SearchResult) => {
      navigate(buildMapUrl(result));
    },
    [navigate]
  );

  return <SearchScreen onSearch={handleSearch} />;
};

export default Index;
