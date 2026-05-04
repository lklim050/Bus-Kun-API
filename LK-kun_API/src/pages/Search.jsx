import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Search = () => {
  const [input, setInput] = useState("");
  const LtaDataQuery = useQuery({
    queryKey: ["ltadata"],
    queryFn: () => fetchLtaData(input),
    enabled: false,
  });

  return (
    <div>
      <h1>SEARCH</h1>
      <br />
    </div>
  );
};

export default Search;
