import _ from 'lodash';
import { useFetcher, useLoaderData } from 'react-router';
import { useToast } from '~/hooks/use-toast';
import { type LoaderData } from '~/libs/types';

export const PAGE_SIZE = 10;

function useData<ModelType>(): {
  fetcher: ReturnType<typeof useFetcher>;
  data: LoaderData<ModelType>['data'];
} {
  const fetcher = useFetcher<LoaderData<ModelType>>();
  const loaderData = useLoaderData<LoaderData<ModelType>>();
  const { toast } = useToast();

  const data =
    fetcher.data?.lastUpdated &&
    new Date(fetcher.data?.lastUpdated) > new Date(loaderData?.lastUpdated || 0)
      ? fetcher.data.data
      : loaderData.data;

  if (loaderData.error || fetcher.data?.error) {
    toast({
      title: 'Error',
      description: loaderData.error || fetcher.data?.error,
      variant: 'destructive',
    });
  }

  return {
    data: {
      results: _.isEmpty(data?.results) ? [] : data?.results,
      count: data?.count || 0,
      next: data?.next || null,
      previous: data?.previous || null,
    },
    fetcher,
  };
}

export default useData;
