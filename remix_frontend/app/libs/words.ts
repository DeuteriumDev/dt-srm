const PLURAL_SINGLE_WORD_MAP = {
  groups: 'group',
  folders: 'folder',
  users: 'user',
  
};

export const singularize = (word: string): string =>
  PLURAL_SINGLE_WORD_MAP[word as keyof typeof PLURAL_SINGLE_WORD_MAP];
