import _, { isArray, isBoolean, isObject } from 'lodash';
import { data } from 'react-router';

export type BaseSearchParams = Record<
  string,
  | string
  | undefined
  | string[]
  | number
  | null
  | boolean
  | Record<string, string | undefined | string[] | number | null | boolean>
>;

const NS_DIVIDER = '::';
export class RequestHelper {
  private url: URL;
  private request: Request;
  constructor(req: Request) {
    this.request = req;
    this.url = new URL(req.url);
  }

  public getSearchParams<Params extends BaseSearchParams>(): Params {
    const params: BaseSearchParams = {};
    this.url.searchParams.forEach((value, key) => {
      if (key.indexOf(NS_DIVIDER) > -1) {
        const [ns, nestedKey] = key.split(NS_DIVIDER);
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

  /**
   * Checks that the provided request is one of the allowed methods
   * @param {string[]} methods - array of allowed request methods
   * @returns {boolean}
   */
  public validateMethods(methods: string[]) {
    if (!methods.includes(this.request.method))
      throw data({ error: 'Method not allowed' }, { status: 400 });
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
      if (_.isObject(value)) {
        const nameSpacedObject = Object.keys(value).reduce(
          (obj, k) => {
            _.set(obj, `${key}${NS_DIVIDER}${k}`, value[k]);
            return obj;
          },
          {} as Record<string, string>,
        );
        return `${prev}&${RequestHelper.parseSearchParams(nameSpacedObject)}`;
      }
      if (_.isBoolean(value) || value) {
        return `${prev}&${_.escape(key)}=${_.escape(String(value))}`;
      }
      return prev;
    }, '');
  }
}
