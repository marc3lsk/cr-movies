import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Pagination, PaginationItem, TextField } from "@mui/material";

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

  const isMore = useMemo(() => {
    const more = searchParams.get("more");
    return typeof more == "string";
  }, [searchParams]);

  useEffect(() => {
    if (!isMore) setMovieCache({});
  }, [isMore]);

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
    <div className="mx-auto p-4 justify-center flex flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setMovieCache({});
          setSearchParams({ query });
        }}
      >
        <TextField
          label="Search for a movie"
          variant="filled"
          onChange={(e) => {
            setQuery(e.target.value);
            debounced(e.target.value);
          }}
          className="w-96"
        />
        <button
          type="submit"
          className="hidden"
          title="to make submit work with enter key"
        />
      </form>

      {totalResults > 0 && (
        <>
          <ul className="mt-8 mb-4">
            {new Array(currentPage)
              .fill(0)
              .flatMap((_, page) =>
                movieCache[page + 1]?.map((movie: MovieData) => (
                  <li key={movie.imdbID}>{movie.Title}</li>
                )),
              )}
          </ul>
          {isLoading && <div>Loading...</div>}
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
                  search:
                    `?query=${query}&page=${item.page}` +
                    (item.type == "next" || (item.type == "previous" && isMore)
                      ? "&more"
                      : ""),
                }}
                {...item}
              />
            )}
          />
        </>
      )}
    </div>
  );
}
