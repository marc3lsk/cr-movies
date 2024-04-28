import FavouriteMovieCard from "../components/favourite-movie-card";
import useFavouriteMoviesStore from "../stores/favourite-movies-store";

export default function FavouriteMoviesPage() {
  const favouriteMoviesStore = useFavouriteMoviesStore();

  return (
    <ul className="mb-4 mt-8 flex flex-wrap gap-16">
      {favouriteMoviesStore.favouriteMovies.map((movieId) => (
        <li key={movieId}>
          <FavouriteMovieCard movieId={movieId} />
        </li>
      ))}
    </ul>
  );
}
