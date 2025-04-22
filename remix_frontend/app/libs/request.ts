import _ from 'lodash';
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

  private static toNamespacedParams<Params extends BaseSearchParams>(
    paramObject: Record<string, string>,
  ): Params {
    const final = {};
    Object.keys(paramObject).forEach((key) => {
      if (key.indexOf(NS_DIVIDER) > -1) {
        const [ns, nestedKey] = key.split(NS_DIVIDER);
        if (_.isEmpty(_.get(final, ns))) {
          _.set(final, ns, {});
        }
        _.set(final, `${ns}.${nestedKey}`, paramObject[key]);
      } else {
        _.set(final, key, paramObject[key]);
      }
    });
    return final as Params;
  }

  public getSearchParams<Params extends BaseSearchParams>(): Params {
    return RequestHelper.toNamespacedParams<Params>(
      Object.fromEntries(this.url.searchParams.entries()),
    );
  }

  static URLSearchParamsTo<Params extends BaseSearchParams>(
    urlSearchParams: URLSearchParams,
  ): Params {
    return RequestHelper.toNamespacedParams<Params>(
      Object.fromEntries(urlSearchParams.entries()),
    );
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
