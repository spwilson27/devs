export const NATIVE_PACKAGES: Record<string, { alternative: string | null }> = {
  'better-sqlite3': { alternative: 'sql.js' },
  'sharp':          { alternative: null },
  'bcrypt':         { alternative: 'bcryptjs' },
  'canvas':         { alternative: null },
  'node-sass':      { alternative: 'sass' },
  'sqlite3':        { alternative: 'sql.js' },
};

export class NativeDependencyChecker {
  requiresNativeCompilation(packageName: string): boolean {
    return Boolean(NATIVE_PACKAGES[packageName]);
  }

  getAlternative(packageName: string): string | null {
    return NATIVE_PACKAGES[packageName]?.alternative ?? null;
  }
}
