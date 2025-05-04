import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { Router, router } from "./router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </StrictMode>
  );
}
