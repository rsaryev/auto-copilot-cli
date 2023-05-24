import path from 'path';

export const programmingLanguageExtensions = {
  Text: ['.txt'],
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

export const excludePackagesFilesList = {
  JavaScript: ['package-lock.json', 'yarn.lock'],
  Python: ['requirements.txt'],
  Java: ['pom.xml'],
  Go: ['go.mod'],
  PHP: ['composer.json'],
  Ruby: ['Gemfile'],
  Rust: ['Cargo.toml'],
  Swift: ['Package.swift'],
  Kotlin: ['build.gradle'],
  Scala: ['build.sbt'],
  'Objective-C': ['Podfile'],
  Shell: ['package.json'],
  Perl: ['cpanfile'],
  Lua: ['rockspec'],
};

export const extensionsList = Object.values(programmingLanguageExtensions).flat();
export const extensions = new Set<string>(extensionsList);
export const excludePackagesFiles = new Set<string>(Object.values(excludePackagesFilesList).flat());

export const filterFilesByExtensions = (files: string[]): string[] => {
  return files.filter((file) => extensions.has(path.extname(file)));
};
