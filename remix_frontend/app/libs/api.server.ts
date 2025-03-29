import * as apiRest from '../../codegen/django-rest';

apiRest.client.setConfig({
  baseUrl: process.env.OAUTH_URL,
  throwOnError: true,
});

export default apiRest;
