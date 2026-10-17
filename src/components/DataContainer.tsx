import { useTriviaData } from "../hooks/useTriviaData";
import LoadingSpinner from "./loading/LoadingSpinner";
import ErrorMessage from "./loading/ErrorMessage";
import EmptyState from "./loading/EmptyState";
import Chart from "./chart/Chart";
import FilterPanel from "./filterPanel/FilterPanel";
import { OPTION } from "../constants/constants";
import { useState } from "react";

export default function DataContainer() {
  const { data, isLoading, error } = useTriviaData(50);
  const [activeFilter, setActiveFilter] = useState(OPTION.category);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  function loadPage(){
    if (isLoading) return <LoadingSpinner label="Loading trivia data..." />;
    if (error) return <ErrorMessage message={error} />;
    if (!data || data.length === 0) return <EmptyState />;
    return  <Chart
        data={data}
        selectedCategory={selectedCategory}
        activeFilter={activeFilter}
      />
  }

  return (
    <section className="card bg-base-100 shadow-xl border border-base-300 max-w-[90%] mx-auto py-4 rounded-2xl">
      <FilterPanel
        data={data}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      {loadPage()}

    </section>
  );
}