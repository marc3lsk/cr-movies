import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Pagination, PaginationItem, TextField } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { clsx } from "clsx/lite";
import useFavouriteMoviesStore from "../stores/favourite-movies-store";
import { SearchResultsMovieListItem } from "../models/search-results-movie-list-item";

const PAGING_SIZE = 10;

const searchMovies = async ({ query = "", page = 1 }) => {
  const response = await fetch(
    `https://omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&s=${query}&page=${page}`,
  );
  return response.json() as unknown as SearchMoviesResponse;
};

type SearchResults = {
  Response: "True";
  Search: SearchResultsMovieListItem[];
  totalResults: string;
};

type ErrorResponse = { Response: "False"; Error: string };

type SearchMoviesResponse = SearchResults | ErrorResponse;

export default function SearchMoviesPage() {
  const favouriteMoviesStore = useFavouriteMoviesStore();

  const [movieCache, setMovieCache] = useState(
    {} as { [page: string]: SearchResultsMovieListItem[] },
  );

  function clearMovieCache() {
    setMovieCache({});
    setTotalResults(-1);
  }

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
    if (!searchQuery) clearMovieCache();
  }, [searchQuery]);

  useEffect(() => {
    if (!isMore) setMovieCache({});
  }, [isMore, currentPage]);

  useEffect(clearMovieCache, [searchQuery]);

  const searchMoviesQuery = useQuery<SearchMoviesResponse>({
    queryKey: ["search-movies", searchQuery, currentPage],
    queryFn: async () => {
      const response = await searchMovies({
        page: currentPage,
        query: searchQuery,
      });

      if (response.Response == "False") {
        clearMovieCache();
        return response;
      }

      setMovieCache((prev) => ({ ...prev, [currentPage]: response.Search }));
      setTotalResults(() => parseInt(response.totalResults));

      return response;
    },
    enabled: !!searchQuery,
    refetchOnWindowFocus: false,
  });

  const [totalResults, setTotalResults] = useState(-1);

  const showResults = useMemo(
    () => !!searchQuery && totalResults > 0,
    [searchQuery, totalResults],
  );

  const responseErrorMessage = useMemo(
    () =>
      searchMoviesQuery.data?.Response == "False"
        ? searchMoviesQuery.data?.Error
        : undefined,
    [searchMoviesQuery.data],
  );

  const showButtonLoadMore = useMemo(
    () =>
      !searchMoviesQuery.isFetching && totalResults > currentPage * PAGING_SIZE,
    [totalResults, currentPage, searchMoviesQuery.isFetching],
  );

  const [searchQueryInputValue, setSearchQueryInputValue] =
    useState(searchQuery);

  useEffect(
    () =>
      console.info(
        { showResults, isFetching: searchMoviesQuery.isFetching, currentPage },
        !showResults && searchMoviesQuery.isFetching && !currentPage,
      ),
    [showResults, searchMoviesQuery.isFetching, currentPage],
  );

  function onSubmitSearchQuery(e: React.FormEvent) {
    e.preventDefault();
    clearMovieCache();
    setSearchParams({ query: searchQueryInputValue });
  }

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      if (value == searchQuery) return;

      clearMovieCache();

      if (typeof value == "string" && value.length > 0) {
        setSearchParams({ query: value });
        return;
      }

      setSearchParams({});
    },
    // delay in ms
    1000,
  );

  function onChangeSearchQueryInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQueryInputValue(e.target.value);
    debounced(e.target.value);
  }

  return (
    <>
      <Helmet>
        <title>Search movies</title>
      </Helmet>
      <div className="mx-auto flex flex-col justify-center">
        <form onSubmit={onSubmitSearchQuery}>
          <TextField
            label="Search for a movie"
            variant="filled"
            onChange={onChangeSearchQueryInput}
            className="w-96"
            value={searchQueryInputValue}
          />
          <button
            type="submit"
            className="hidden"
            title="to make submit work with enter key"
          />
        </form>

        {searchMoviesQuery.isError && (
          <p className="my-4">Error fetching data</p>
        )}

        {responseErrorMessage && <p className="my-4">{responseErrorMessage}</p>}

        {!showResults && searchMoviesQuery.isFetching && (
          <p className="my-4">Searching...</p>
        )}

        {showResults && (
          <>
            <ul className="mb-4 mt-8 flex flex-wrap gap-16">
              {Object.keys(movieCache).flatMap((page) =>
                movieCache[page]?.map((movie: SearchResultsMovieListItem) => (
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
                )),
              )}
            </ul>

            {searchMoviesQuery.isFetching && <p className="my-4">Loading...</p>}
            {searchMoviesQuery.isError && (
              <p className="my-4">Error fetching data</p>
            )}

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
              count={Math.ceil(totalResults / PAGING_SIZE)}
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
