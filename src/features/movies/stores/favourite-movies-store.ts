import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavouriteMoviesStoreState = {
  favouriteMovies: Array<string>;
  isFavourite: (movieId: string) => boolean;
  addFavouriteMovie: (movieId: string) => void;
  removeFavouriteMovie: (movieId: string) => void;
};

const useFavouriteMoviesStore = create<FavouriteMoviesStoreState>()(
  persist(
    (set, get) => ({
      favouriteMovies: [] as Array<string>,
      isFavourite: (movieId: string) =>
        get().favouriteMovies.indexOf(movieId) > -1,
      addFavouriteMovie: (movieId: string) =>
        set((state) => ({
          favouriteMovies: [...state.favouriteMovies, movieId],
        })),
      removeFavouriteMovie: (movieId: string) =>
        set((state) => ({
          favouriteMovies: state.favouriteMovies.filter((id) => movieId !== id),
        })),
    }),
    { name: "favourite-movies" },
  ),
);

export default useFavouriteMoviesStore;
