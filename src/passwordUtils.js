const CHAR_SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const AMBIGUOUS = /[Il1O0]/;

/** Generates a password from CSPRNG bytes, not Math.random. */
export function generatePassword({ length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous }) {
  let pool = '';
  if (useLower) pool += CHAR_SETS.lower;
  if (useUpper) pool += CHAR_SETS.upper;
  if (useNumbers) pool += CHAR_SETS.numbers;
  if (useSymbols) pool += CHAR_SETS.symbols;

  if (excludeAmbiguous) {
    pool = pool.replace(AMBIGUOUS, '');
  }

  if (!pool) {
    return '';
  }

  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += pool[bytes[i] % pool.length];
  }
  return result;
}

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

/** Rough entropy-based strength estimate — nothing here ever leaves the browser. */
export function scorePassword(password) {
  const checks = {
    length8: password.length >= 8,
    length12: password.length >= 12,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  };

  let poolSize = 0;
  if (checks.lower) poolSize += 26;
  if (checks.upper) poolSize += 26;
  if (checks.number) poolSize += 10;
  if (checks.symbol) poolSize += 32;

  const entropyBits = password.length && poolSize
    ? Math.round(password.length * Math.log2(poolSize))
    : 0;

  let score = 0;
  if (password.length > 0) score = 1;
  if (entropyBits >= 28) score = 2;
  if (entropyBits >= 40) score = 3;
  if (entropyBits >= 60) score = 4;
  if (password.length && password.length < 8) score = Math.min(score, 1);

  return {
    checks,
    entropyBits,
    score,
    label: STRENGTH_LABELS[score],
  };
}
