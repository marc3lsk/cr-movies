import FavouriteMovieCard from "../components/favourite-movie-card";
import useFavouriteMoviesStore from "../stores/favourite-movies-store";

export default function FavouriteMoviesPage() {
  const favouriteMoviesStore = useFavouriteMoviesStore();

  return (
    <ul className="mt-8 mb-4 flex flex-wrap gap-16">
      {favouriteMoviesStore.favouriteMovies.map((movieId) => (
        <li key={movieId}>
          <FavouriteMovieCard movieId={movieId} />
        </li>
      ))}
    </ul>
  );
}
