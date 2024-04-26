import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const searchMovies = async ({ pageParam = 1 }) => {
  const response = await fetch(
    `https://omdbapi.com/?apikey=${import.meta.env.VITE_OMDB_API_KEY}&s=Batman&page=${pageParam}`,
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

export default function Search() {
  const { data, isLoading, isError, fetchNextPage } = useInfiniteQuery({
    queryKey: ["users"],
    queryFn: ({ pageParam }) => searchMovies({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: function (_1, _2, lastPage) {
      return lastPage + 1;
    },
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  });

  useEffect(() => console.info(data), [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <ul>
      {data?.pages.map((page) =>
        page.Search?.map((movie: MovieData) => (
          <li key={movie.imdbID}>{movie.Title}</li>
        )),
      )}
      <button onClick={() => fetchNextPage()} className="mt-4">
        » Load more «
      </button>
    </ul>
  );
}
