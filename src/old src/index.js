import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import "./index.css";
import { BrowserRouter } from "react-router-dom";

import ThemeProvider from "./ThemeProvider";
const container = document.getElementById("root");
const root = createRoot(container);

// Import your publishable key
const PUBLISHABLE_KEY = "pk_test_ZmlybS10YWhyLTkyLmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
root.render(
  <BrowserRouter>
    <ThemeProvider>
      {/* <Provider store={store}> */}
      {/* <ClerkProvider publishableKey={PUBLISHABLE_KEY}> */}
      <App />
      {/* </ClerkProvider> */}
      {/* </Provider> */}
    </ThemeProvider>
  </BrowserRouter>
);
