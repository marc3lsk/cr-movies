import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { TextField } from "@mui/material";

const searchMovies = async ({ pageParam = 1, query = "" }) => {
  const response = await fetch(
    `https://omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&s=${query}&page=${pageParam}`,
  );
  return response.json();
};

type MovieData = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
};

type SearchResults = {
  Search: MovieData[];
  totalResults: string;
};

export default function Search() {
  const [, setSearchParams] = useSearchParams();

  const [movieCache, setMovieCache] = useState(
    {} as { [index: number]: MovieData[] },
  );

  const [totalResults, setTotalResults] = useState(-1);

  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const currentPage = useMemo(() => {
    const page = searchParams.get("page");
    return page ? parseInt(page) : 1;
  }, [searchParams]);

  const searchQuery = useMemo(() => {
    const query = searchParams.get("query");
    return query ?? "";
  }, [searchParams]);

  const [query, setQuery] = useState(searchQuery);

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      if (value == searchQuery) return;
      setMovieCache({});
      setSearchParams({ query: value });
    },
    // delay in ms
    1000,
  );

  const { isLoading, isError } = useInfiniteQuery({
    queryKey: ["movies", searchQuery, currentPage],
    queryFn: async ({ pageParam }) => {
      const movies: SearchResults = await searchMovies({
        pageParam,
        query: searchQuery,
      });

      setMovieCache((prev) => ({ ...prev, [pageParam]: movies.Search }));
      setTotalResults(() => parseInt(movies.totalResults));

      return movies;
    },
    initialPageParam: currentPage,
    getNextPageParam: (_1, _2, lastPage) => lastPage + 1,
    getPreviousPageParam: () => currentPage,
    enabled: !!searchQuery,
    refetchOnWindowFocus: false,
  });

  const showButtonLoadMore = useMemo(
    () => totalResults > currentPage * 10,
    [totalResults, currentPage],
  );

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setMovieCache({});
          setSearchParams({ query });
        }}
      >
        <TextField
          label="Search for a movie"
          variant="standard"
          onChange={(e) => {
            setQuery(e.target.value);
            debounced(e.target.value);
          }}
        />
        <button
          type="submit"
          className="hidden"
          title="to make submit work with enter key"
        />
      </form>
      <h1>{searchQuery}</h1>

      <ul>
        {new Array(currentPage)
          .fill(0)
          .flatMap((_, page) =>
            movieCache[page + 1]?.map((movie: MovieData) => (
              <li key={movie.imdbID}>{movie.Title}</li>
            )),
          )}
        {isLoading && <div>Loading...</div>}
        {showButtonLoadMore && (
          <Link
            to={{ search: `?query=${query}&page=${currentPage + 1}` }}
            className="block mt-4"
          >
            » Load more «
          </Link>
        )}
      </ul>
    </>
  );
}
