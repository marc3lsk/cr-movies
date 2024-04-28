import { Helmet } from "react-helmet-async";
import FavouriteMovieCard from "../components/favourite-movie-card";
import useFavouriteMoviesStore from "../stores/favourite-movies-store";

export default function FavouriteMoviesPage() {
  const favouriteMoviesStore = useFavouriteMoviesStore();

  return (
    <>
      <Helmet>
        <title>My favourite movies</title>
      </Helmet>
      <ul className="mb-4 mt-8 flex flex-wrap gap-16">
        {favouriteMoviesStore.favouriteMovies.map((movieId) => (
          <li key={movieId}>
            <FavouriteMovieCard movieId={movieId} />
          </li>
        ))}
      </ul>
    </>
  );
}
