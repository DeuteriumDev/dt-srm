import * as apiRest from '../../codegen/django-rest';

apiRest.client.setConfig({
  baseUrl: process.env.OAUTH_URL,
});

export class ApiError extends Error {
  options: Response;
  constructor(message: string, options: Response) {
    super(message);
    this.name = 'ApiError';
    this.options = options;
  }
}
/*
any changes here requires:
- turning off the server
- refreshing the page
- turning on the server
- refreshing the page
*/
apiRest.client.interceptors.response.use(async (response) => {
  if (response.status > 299) {
    throw new ApiError(response.statusText, response);
  }
  return response;
});
export default apiRest;
