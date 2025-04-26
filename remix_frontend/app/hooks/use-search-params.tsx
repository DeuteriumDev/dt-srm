import { useSearchParams as useSearchParamsRR } from 'react-router';
import { type BaseSearchParams, RequestHelper } from '~/libs/request';

function useSearchParams<SearchParams extends BaseSearchParams>(): {
  searchParams: SearchParams;
  setSearchParams: ReturnType<typeof useSearchParamsRR>[1];
  toString: () => string;
} {
  const [search, setSearch] = useSearchParamsRR();
  return {
    toString: () =>
      RequestHelper.parseSearchParams(
        RequestHelper.URLSearchParamsTo<SearchParams>(search),
      ),
    searchParams: RequestHelper.URLSearchParamsTo<SearchParams>(search),
    setSearchParams: setSearch,
  };
}
export default useSearchParams;
