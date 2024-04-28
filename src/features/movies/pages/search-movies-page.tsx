import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Pagination, PaginationItem, TextField } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
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
    if (!isMore || !searchQuery) setMovieCache({});
  }, [isMore, currentPage, searchQuery]);

  useEffect(() => {
    setMovieCache({});
    setTotalResults(-1);
  }, [searchQuery]);

  const [movieCache, setMovieCache] = useState(
    {} as { [index: number]: SearchResultsMovieListItem[] },
  );

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

  const [totalResults, setTotalResults] = useState(-1);

  const showResults = useMemo(
    () => !!searchQuery && totalResults > 0,
    [searchQuery, totalResults],
  );

  const showNoMoviesFound = useMemo(
    () => !isLoading && !!searchQuery && !(totalResults > 0),
    [isLoading, searchQuery, totalResults],
  );

  const showButtonLoadMore = useMemo(
    () => totalResults > currentPage * 10,
    [totalResults, currentPage],
  );

  const [searchQueryInputValue, setSearchQueryInputValue] =
    useState(searchQuery);

  function onSubmitQuery(e: React.FormEvent) {
    e.preventDefault();
    setMovieCache({});
    setSearchParams({ query: searchQueryInputValue });
  }

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      if (value == searchQuery) return;
      setMovieCache({});
      if (typeof value == "string" && value.length > 0)
        setSearchParams({ query: value });
      else setSearchParams({});
    },
    // delay in ms
    1000,
  );

  function onChangeQuery(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQueryInputValue(e.target.value);
    debounced(e.target.value);
  }

  return (
    <>
      <Helmet>
        <title>Search movies</title>
      </Helmet>
      <div className="mx-auto flex flex-col justify-center">
        <form onSubmit={onSubmitQuery}>
          <TextField
            label="Search for a movie"
            variant="filled"
            onChange={onChangeQuery}
            className="w-96"
            value={searchQueryInputValue}
          />
          <button
            type="submit"
            className="hidden"
            title="to make submit work with enter key"
          />
        </form>

        {showNoMoviesFound && <p className="my-4">Oops, no movies found</p>}

        {!showResults && isLoading && <p className="my-4">Searching...</p>}

        {!showResults && isError && <p className="my-4">Error fetching data</p>}

        {showResults && (
          <>
            <ul className="mb-4 mt-8 flex flex-wrap gap-16">
              {new Array(currentPage).fill(0).flatMap((_, page) =>
                movieCache[page + 1]?.map(
                  (movie: SearchResultsMovieListItem) => (
                    <li key={movie.imdbID} className={clsx("max-w-72")}>
                      <Link
                        to={{ pathname: `movie/${movie.imdbID}` }}
                        className="flex flex-col gap-y-4"
                      >
                        <img src={movie.Poster} alt={movie.Title} />
                        <span>
                          {movie.Title}
                          {favouriteMoviesStore.isFavourite(movie.imdbID) && (
                            <StarIcon className="ml-2" />
                          )}
                        </span>
                      </Link>
                    </li>
                  ),
                ),
              )}
            </ul>

            {isLoading && <div>Loading...</div>}
            {isError && <div>Error fetching data</div>}

            {showButtonLoadMore && (
              <Link
                to={{
                  search: `?query=${searchQueryInputValue}&page=${currentPage + 1}&more`,
                }}
                className="my-4 block"
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
                    search: `?query=${searchQueryInputValue}&page=${item.page}`,
                  }}
                  {...item}
                />
              )}
            />
          </>
        )}
      </div>
    </>
  );
}
