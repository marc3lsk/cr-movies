import clsx from "clsx";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MovieDetail } from "../models/movie-detail";

type Props = {
  movieId: string;
};

export default function FavouriteMovieCard({ movieId }: Props) {
  const getMovieDetail = async (movieId: string) => {
    const response = await fetch(
      `http://omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&i=${movieId}`,
    );
    return response.json();
  };

  const movieDetailQuery = useQuery<MovieDetail>({
    queryKey: ["movie-detail", movieId],
    queryFn: async () => await getMovieDetail(movieId!),
  });

  const movie = useMemo(() => movieDetailQuery.data, [movieDetailQuery.data]);

  if (!movie) return <div>Loading ...</div>;
  return (
    <div key={movie.imdbID} className={clsx("max-w-72")}>
      <Link
        to={{ pathname: `/movie/${movie.imdbID}` }}
        className="flex flex-col gap-y-4"
      >
        <img src={movie.Poster} alt={movie.Title} />
        <span>{movie.Title}</span>
      </Link>
    </div>
  );
}
