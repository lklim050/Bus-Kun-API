import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RouteCard from "../components/RouteCard";
import { fetchLtaData } from "../utils/busApi";
import { useSearchParams } from "react-router";

const Search = () => {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("route");
  const [searchParams, setSearchParams] = useSearchParams();

  const busNoFromUrl = searchParams.get(`busNo`) || "";

  const ltaDataQuery = useQuery({
    queryKey: ["ltadata"],
    queryFn: () => fetchLtaData(input),
    enabled: !!input, // only enabled if there is input
    retry: 1,
  });

  useEffect;
  useEffect(() => {
    setInput(busNoFromUrl);
  }, [busNoFromUrl]);

  const routeData = ltaDataQuery.data ? [...ltaDataQuery.data] : [];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 py-4 sm:py-6 space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          SEARCH
        </h1>
        <div className="flex items-center gap-2 bg-green-50 border border-blue-100 p-3 rounded-lg">
          <span className="text-blue-600 text-lg">💡</span>
          <p className="my-auto text-sm text-blue-800">
            <span className="font-semibold">Tips:</span> Use capital letters for
            alphabet except 'e'.
          </p>
        </div>
      </header>

      {/* Search Input Group */}
      <div className="flex flex-col sm:flex-row gap-2 bg-green-50 p-4 rounded-xl shadow-sm border border-gray-200 ">
        <input
          type="text"
          name="busNo"
          inputMode="numeric"
          pattern="\d"
          value={input}
          placeholder="Input bus number here..."
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
        />
        <button
          type="button"
          onClick={() => ltaDataQuery.refetch()}
          className="bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 active:scale-95 transition-all w-full sm:w-auto"
        >
          SUBMIT
        </button>
      </div>

      {/* Status Messages */}
      {ltaDataQuery.isLoading && (
        <div className="flex items-center justify-center gap-3 py-4 text-gray-600">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Fetching bus route data...</p>
        </div>
      )}

      {ltaDataQuery.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {ltaDataQuery.error.message}
        </div>
      )}

      {/* Results Section */}
      {routeData.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 border-l-4 border-slate-700 pl-3 ">
            <h4 className="text-lg font-bold text-gray-900">
              Bus Route for Service No{"   "}
              <span className="text-blue-600">{input}</span>
            </h4>
          </div>

          <div className="w-full overflow-hidden bg-[url('/backDrop.png')] bg-cover bg-fixed bg-center">
            <RouteCard key={input} routeData={routeData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
