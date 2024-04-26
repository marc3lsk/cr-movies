import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Link, useLocation, useSearchParams } from "react-router-dom";

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

  console.info({ currentPage });

  const [query, setQuery] = useState(searchQuery);

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      setSearchParams({});
      setSearchParams({ query: value });
    },
    // delay in ms
    1000,
  );

  const { data, isLoading, isError, fetchNextPage } = useInfiniteQuery({
    queryKey: ["users", searchQuery],
    queryFn: ({ pageParam }) => {
      //setCurrentPage(() => pageParam);
      return searchMovies({ pageParam, query: searchQuery });
    },
    initialPageParam: currentPage,
    getNextPageParam: (_1, _2, lastPage) => lastPage + 1,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
    enabled: !!searchQuery,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    fetchNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => console.info(data), [data]);

  const totalResults = useMemo(() => {
    if (!data?.pages || !Array.isArray(data.pages) || data.pages.length == 0)
      return -1;

    return parseInt((data.pages[0] as SearchResults).totalResults);
  }, [data]);

  const showButtonLoadMore = useMemo(
    () => totalResults > currentPage * 10,
    [totalResults, currentPage],
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <>
      <form onSubmit={() => setSearchParams({ query })}>
        <input
          type="text"
          onChange={(e) => (
            setQuery(e.target.value), debounced(e.target.value)
          )}
          value={query}
          placeholder="Search for a movie"
          className="border-2 border-gray-500 rounded"
        />
      </form>
      <h1>{searchQuery}</h1>

      <ul>
        {data?.pages.map((page) =>
          page.Search?.map((movie: MovieData) => (
            <li key={movie.imdbID}>{movie.Title}</li>
          )),
        )}
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
