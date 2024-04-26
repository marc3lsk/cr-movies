import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layout/MainLayout.tsx";
import Loading from "./layout/Loading.tsx";
import "./index.css";

const Index = lazy(() => import("./pages/Index"));
const Page2 = lazy(() => import("./pages/Page2.tsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <MainLayout />
      </Suspense>
    ),

    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "page2",
        element: <Page2 />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
