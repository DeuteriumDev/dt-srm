import _ from 'lodash';

const PLURAL_SINGLE_WORD_MAP = {
  groups: 'group',
  folders: 'folder',
  users: 'user',
};

export const singularize = (word: string): string | undefined =>
  PLURAL_SINGLE_WORD_MAP[word as keyof typeof PLURAL_SINGLE_WORD_MAP];

export const pluralize = (word: string): string | undefined =>
  _.find(
    Object.keys(
      PLURAL_SINGLE_WORD_MAP,
    ) as (keyof typeof PLURAL_SINGLE_WORD_MAP)[],
    (k) => PLURAL_SINGLE_WORD_MAP[k] === word,
  ) || undefined;
