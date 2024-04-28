import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "./layout/components/loading.tsx";
import MainLayout from "./layout/main-layout.tsx";

const SearchMoviesPage = lazy(
  () => import("./features/movies/pages/search-movies-page.tsx"),
);

const MovieDetailPage = lazy(
  () => import("./features/movies/pages/movie-detail-page.tsx"),
);

export const router = createBrowserRouter([
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
        element: <SearchMoviesPage />,
      },
      {
        path: "movie/:movieId",
        element: <MovieDetailPage />,
      },
    ],
  },
]);
