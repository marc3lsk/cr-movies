import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MovieDetail } from "../models/movie-detail";
import { useMemo } from "react";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import useFavouriteMoviesStore from "../stores/favourite-movies-store";
import { Helmet } from "react-helmet-async";

export default function MovieDetailPage() {
  const favouriteMoviesStore = useFavouriteMoviesStore();
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

  function onClickAddToFavourites(movieId: string) {
    favouriteMoviesStore.addFavouriteMovie(movieId);
  }

  function onClickRemoveFromFavourites(movieId: string) {
    favouriteMoviesStore.removeFavouriteMovie(movieId);
  }

  function MovieKeyValueList({ data }: { data: { [name: string]: unknown } }) {
    const excludesProperties = ["Title", "Poster", "Response", "imdbID"];

    const filteredKeys = Object.keys(data).filter(
      (key) => !excludesProperties.includes(key),
    );

    return (
      <List>
        {filteredKeys
          .filter((key) => typeof data[key] != "object")
          .map((key) => (
            <ListItem key={key}>
              <ListItemText primary={key} secondary={`${data[key]}`} />
            </ListItem>
          ))}
      </List>
    );
  }

  return (
    <>
      <Helmet>
        <title>{movie?.Title}</title>
      </Helmet>
      {movieDetailQuery.isLoading && <div>Loading...</div>}
      {movie && (
        <>
          <div className="mb-8 flex flex-wrap">
            <h1 className="text-5xl">{movie.Title}</h1>
            {favouriteMoviesStore.isFavourite(movie.imdbID) ? (
              <Button
                onClick={() => onClickRemoveFromFavourites(movie.imdbID)}
                title="Remove from favourites"
              >
                <StarIcon />
              </Button>
            ) : (
              <Button
                onClick={() => onClickAddToFavourites(movie.imdbID)}
                title="Add to favourites"
              >
                <StarOutlineIcon />
              </Button>
            )}
          </div>
          <img src={movie.Poster} />
          <MovieKeyValueList data={movie} />
        </>
      )}
    </>
  );
}
