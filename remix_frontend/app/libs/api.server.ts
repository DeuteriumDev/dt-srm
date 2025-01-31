import _ from 'lodash';
import assert from 'assert';

import * as apiRest from '../../codegen/django-rest';
import { SessionManager } from './session.server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { redirect, type Cookie } from 'react-router';

apiRest.client.setConfig({
  baseUrl: process.env.BASE_URL,
});

export default apiRest;
