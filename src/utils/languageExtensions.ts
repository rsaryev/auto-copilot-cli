import path from 'path';

export const programmingLanguageExtensions = {
  JavaScript: ['.js', '.mjs'],
  TypeScript: ['.ts', '.tsx'],
  CSS: ['.css', '.scss', '.less'],
  HTML: ['.html', '.htm'],
  JSON: ['.json'],
  Python: ['.py'],
  Java: ['.java'],
  C: ['.c'],
  'C++': ['.cpp'],
  'C#': ['.cs'],
  Go: ['.go'],
  PHP: ['.php'],
  Ruby: ['.rb'],
  Rust: ['.rs'],
  Swift: ['.swift'],
  Kotlin: ['.kt'],
  Scala: ['.scala'],
  'Objective-C': ['.m', '.h'],
  Shell: ['.sh'],
  Perl: ['.pl', '.pm'],
  Lua: ['.lua'],
  SQL: ['.sql'],
};

export const extensions = new Set<string>(Object.values(programmingLanguageExtensions).flat());
export const filterFilesByExtensions = (files: string[]): string[] => {
  return files.filter((file) => extensions.has(path.extname(file)));
};
