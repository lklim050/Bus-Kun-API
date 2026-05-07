import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router";
import DashBoard from "./pages/DashBoard";
import Nearby from "./pages/Nearby";
import Search from "./pages/Search";
import Navbar from "./components/NavBar";
import Map from "./pages/Map";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<DashBoard />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/search" element={<Search />} />
        <Route path="/map" element={<Map />} />
      </Routes>
      <Navbar />
    </QueryClientProvider>
  );
}

export default App;
