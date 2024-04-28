import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavouriteMoviesStoreState = {
  favouriteMovies: Array<string>;
  addFavouriteMovie: (id: string) => void;
  removeFavouriteMovie: (id: string) => void;
};

const useFavouriteMoviesStore = create<FavouriteMoviesStoreState>()(
  persist(
    (set) => ({
      favouriteMovies: [] as Array<string>,
      addFavouriteMovie: (id: string) =>
        set((state) => ({ favouriteMovies: [...state.favouriteMovies, id] })),
      removeFavouriteMovie: (id: string) =>
        set((state) => ({
          favouriteMovies: state.favouriteMovies.filter(
            (movieId) => movieId !== id,
          ),
        })),
    }),
    { name: "favourite-movies" },
  ),
);

export default useFavouriteMoviesStore;
