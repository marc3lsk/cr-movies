import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MovieDetail } from "../models/movie-detail";

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

  return <h1>{movieDetailQuery.data?.Title}</h1>;
}
