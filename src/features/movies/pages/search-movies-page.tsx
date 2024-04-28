import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Pagination, PaginationItem, TextField } from "@mui/material";
import { clsx } from "clsx/lite";
import useFavouriteMoviesStore from "../stores/favourite-movies-store";
import { SearchResultsMovieListItem } from "../models/search-results-movie-list-item";

const searchMovies = async ({ query = "", page = 1 }) => {
  const response = await fetch(
    `https://omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&s=${query}&page=${page}`,
  );
  return response.json();
};

type SearchResults = {
  Search: SearchResultsMovieListItem[];
  totalResults: string;
};

export default function SearchMoviesPage() {
  const favouriteMoviesStore = useFavouriteMoviesStore();

  const [, setSearchParams] = useSearchParams();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const searchQuery = useMemo(() => {
    const query = searchParams.get("query");
    return query ?? "";
  }, [searchParams]);

  const currentPage = useMemo(() => {
    const page = searchParams.get("page");
    return page ? parseInt(page) : 1;
  }, [searchParams]);

  const isMore = useMemo(() => {
    const more = searchParams.get("more");
    return typeof more == "string";
  }, [searchParams]);

  useEffect(() => {
    if (!isMore) setMovieCache({});
  }, [isMore, currentPage]);

  const [movieCache, setMovieCache] = useState(
    {} as { [index: number]: SearchResultsMovieListItem[] },
  );

  const [totalResults, setTotalResults] = useState(-1);

  const showResults = useMemo(() => totalResults > 0, [totalResults]);

  const showButtonLoadMore = useMemo(
    () => totalResults > currentPage * 10,
    [totalResults, currentPage],
  );

  const [query, setQuery] = useState(searchQuery);

  const { isLoading, isError } = useInfiniteQuery({
    queryKey: ["movies", searchQuery, currentPage],
    queryFn: async ({ pageParam }) => {
      const movies: SearchResults = await searchMovies({
        page: pageParam,
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

  function onSubmitQuery(e: React.FormEvent) {
    e.preventDefault();
    setMovieCache({});
    setSearchParams({ query });
  }

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

  function onChangeQuery(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    debounced(e.target.value);
  }

  return (
    <div className="mx-auto p-4 justify-center flex flex-col">
      <form onSubmit={onSubmitQuery}>
        <TextField
          label="Search for a movie"
          variant="filled"
          onChange={onChangeQuery}
          className="w-96"
        />
        <button
          type="submit"
          className="hidden"
          title="to make submit work with enter key"
        />
      </form>

      {showResults && (
        <>
          <ul className="mt-8 mb-4">
            {new Array(currentPage).fill(0).flatMap((_, page) =>
              movieCache[page + 1]?.map((movie: SearchResultsMovieListItem) => (
                <li
                  key={movie.imdbID}
                  className={clsx(
                    favouriteMoviesStore.favouriteMovies.indexOf(movie.imdbID) >
                      -1 && "font-bold",
                  )}
                >
                  <Link
                    to={{ pathname: `movie/${movie.imdbID}` }}
                    className="block my-4"
                  >
                    {movie.Title}
                  </Link>
                </li>
              )),
            )}
          </ul>

          {isLoading && <div>Loading...</div>}
          {isError && <div>Error fetching data</div>}

          {showButtonLoadMore && (
            <Link
              to={{ search: `?query=${query}&page=${currentPage + 1}&more` }}
              className="block my-4"
            >
              » Load more «
            </Link>
          )}

          <Pagination
            page={currentPage}
            count={Math.ceil(totalResults / 10)}
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                to={{
                  search: `?query=${query}&page=${item.page}`,
                }}
                {...item}
              />
            )}
          />
        </>
      )}

      <h1 className="my-4">
        Favourite movies: {favouriteMoviesStore.favouriteMovies.join(", ")}
      </h1>
    </div>
  );
}
