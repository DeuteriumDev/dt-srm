import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: '../django_api/schema.yml',
  output: './codegen/django-rest',
  plugins: [
    ...defaultPlugins,
    {
      enums: false,
      name: '@hey-api/typescript',
    },
  ],
});
