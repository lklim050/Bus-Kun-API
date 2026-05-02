import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TestAPI from "./components/TestAPI";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestAPI />
    </QueryClientProvider>
  );
}

export default App;
