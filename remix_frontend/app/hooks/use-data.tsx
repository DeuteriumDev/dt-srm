import { useFetcher, useLoaderData } from 'react-router';

export const PAGE_SIZE = 10;

function useData<TLoaderData extends { lastUpdated: string }>(): {
  fetcher: ReturnType<typeof useFetcher>;
  data: TLoaderData;
} {
  const fetcher = useFetcher();
  const loaderData = useLoaderData<TLoaderData>();

  const data =
    fetcher.data?.lastUpdated &&
    new Date(fetcher.data?.lastUpdated) > new Date(loaderData.lastUpdated)
      ? fetcher.data
      : loaderData;

  return {
    data,
    fetcher,
  };
}

export default useData;
