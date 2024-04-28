import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MovieDetail } from "../models/movie-detail";
import { useMemo } from "react";

export default function MovieDetailPage() {
  const { movieId } = useParams();

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

  return (
    <>
      {movieDetailQuery.isLoading && <div>Loading...</div>}
      {movie && (
        <>
          <img src={movie.Poster} />
          <h1>{movie.Title}</h1>
        </>
      )}
    </>
  );
}
