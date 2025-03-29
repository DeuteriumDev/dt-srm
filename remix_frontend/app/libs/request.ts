import _ from 'lodash';

type BaseSearchParams = Record<
  string,
  | string
  | undefined
  | string[]
  | number
  | null
  | boolean
  | Record<string, string | undefined | string[] | number | null | boolean>
>;
export class RequestHelper {
  private url: URL;
  constructor(req: Request) {
    this.url = new URL(req.url);
  }

  public getSearchParams<Params extends BaseSearchParams>(): Params {
    const params: BaseSearchParams = {};
    this.url.searchParams.forEach((value, key) => {
      if (key.indexOf('-') > -1) {
        const [ns, nestedKey] = key.split('-');
        if (_.isEmpty(params[ns])) {
          params[ns] = {};
        }
        (params[ns] as Record<string, string>)[nestedKey] = value;
      } else {
        params[key] = value;
      }
    });
    return params as Params;
  }

  get pathname() {
    return this.url.pathname;
  }

  static parseSearchParams(searchParams: BaseSearchParams): string {
    return Object.keys(searchParams).reduce((prev, key) => {
      const value = searchParams[key];
      if (_.isArray(value)) {
        return `${prev}&${_.escape(key)}=${value.map(_.escape).join(',')}`;
      }
      if (_.isBoolean(value) || value) {
        return `${prev}&${_.escape(key)}=${_.escape(String(value))}`;
      }
      if (_.isObject(value)) {
        const nameSpacedObject = Object.keys(value).reduce(
          (obj, k) => {
            obj[`${key}-${k}`] = value[k];
            return obj;
          },
          {} as Record<string, string>,
        );
        return `${prev}&${RequestHelper.parseSearchParams(nameSpacedObject)}`;
      }
      return prev;
    }, '');
  }
}
