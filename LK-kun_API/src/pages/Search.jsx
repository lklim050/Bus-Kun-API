import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import RouteCard from "../components/RouteCard";
import { fetchLtaData } from "../utils/busApi";

const Search = () => {
  const [input, setInput] = useState("");
  const LtaDataQuery = useQuery({
    queryKey: ["ltadata"],
    queryFn: () => fetchLtaData(input),
    enabled: false,
    retry: 1,
  });

  const routeData = LtaDataQuery.data ? [...LtaDataQuery.data] : [];

  return (
    <div>
      <h1>SEARCH</h1>
      <p>Tips: use capital letter for alphabet except e</p>
      <input
        type="text"
        name="busNo"
        inputMode="numeric"
        pattern="\d"
        value={input}
        placeholder="input bus number here..."
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          LtaDataQuery.refetch();
        }}
      >
        SUBMIT
      </button>
      <br />
      {LtaDataQuery.isLoading && <p>fetching bus number routes</p>}
      {LtaDataQuery.isError && <p>{LtaDataQuery.error.message}</p>}
      {routeData.length > 0 && (
        <div>
          <h3>Bus Route for Service No {input}</h3>
          <br />
          <RouteCard key={input} routeData={routeData} />
          <br />
        </div>
      )}
      {LtaDataQuery.isLoading && <p>Fetching LTA DATA...</p>}
      {LtaDataQuery.isError && <p>{LtaDataQuery.error.message}</p>}

      <br />
    </div>
  );
};

export default Search;
