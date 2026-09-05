import { useEffect, useMemo, useState, useCallback } from 'react';
import { generatePassword, scorePassword } from './passwordUtils';
import './App.css';

const DEFAULT_OPTIONS = {
  length: 16,
  useUpper: true,
  useLower: true,
  useNumbers: true,
  useSymbols: true,
  excludeAmbiguous: false,
};

const THEME_KEY = 'password-generator-theme';

function readInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function App() {
  const [theme, setTheme] = useState(readInitialTheme);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [checkValue, setCheckValue] = useState('');
  const [showCheckValue, setShowCheckValue] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const regenerate = useCallback((opts) => {
    setPassword(generatePassword(opts));
    setCopied(false);
  }, []);

  useEffect(() => {
    regenerate(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOption = (patch) => {
    const next = { ...options, ...patch };
    const anySetEnabled = next.useUpper || next.useLower || next.useNumbers || next.useSymbols;
    if (!anySetEnabled) {
      return;
    }
    setOptions(next);
    regenerate(next);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — password is still selectable/visible */
    }
  };

  const generatedStrength = useMemo(() => scorePassword(password), [password]);
  const checkedStrength = useMemo(() => scorePassword(checkValue), [checkValue]);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">🔒</span>
          <span className="brand-name">Password <strong>Generator</strong></span>
        </div>
        <button type="button" className="btn btn-icon" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light / dark theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="workspace">
        <section className="panel">
          <h2>Generate a password</h2>

          <div className="password-display">
            <input type="text" readOnly value={password} aria-label="Generated password" />
            <button type="button" className="btn" onClick={() => regenerate(options)}>⟳</button>
            <button type="button" className="btn btn-accent" onClick={copyPassword} disabled={!password}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="strength-meter" aria-hidden="true">
            <div className={`strength-fill strength-${generatedStrength.score}`} style={{ width: `${(generatedStrength.score / 4) * 100}%` }} />
          </div>
          <p className="strength-label">{password ? generatedStrength.label : 'Choose at least one character set'}</p>

          <div className="field">
            <label htmlFor="length">Length: {options.length}</label>
            <input
              id="length"
              type="range"
              min="6"
              max="48"
              value={options.length}
              onChange={(e) => updateOption({ length: Number(e.target.value) })}
            />
          </div>

          <div className="checkbox-grid">
            <label className="checkbox">
              <input type="checkbox" checked={options.useUpper} onChange={(e) => updateOption({ useUpper: e.target.checked })} />
              Uppercase (A-Z)
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={options.useLower} onChange={(e) => updateOption({ useLower: e.target.checked })} />
              Lowercase (a-z)
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={options.useNumbers} onChange={(e) => updateOption({ useNumbers: e.target.checked })} />
              Numbers (0-9)
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={options.useSymbols} onChange={(e) => updateOption({ useSymbols: e.target.checked })} />
              Symbols (!@#$…)
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={options.excludeAmbiguous} onChange={(e) => updateOption({ excludeAmbiguous: e.target.checked })} />
              Exclude ambiguous (I l 1 O 0)
            </label>
          </div>
        </section>

        <section className="panel">
          <h2>Check a password's strength</h2>
          <p className="hint">Type or paste any password below — it's scored entirely in your browser and never sent anywhere.</p>

          <div className="password-display">
            <input
              type={showCheckValue ? 'text' : 'password'}
              value={checkValue}
              onChange={(e) => setCheckValue(e.target.value)}
              placeholder="Enter a password to check"
              aria-label="Password to check"
            />
            <button type="button" className="btn" onClick={() => setShowCheckValue((v) => !v)}>
              {showCheckValue ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="strength-meter" aria-hidden="true">
            <div className={`strength-fill strength-${checkedStrength.score}`} style={{ width: `${(checkedStrength.score / 4) * 100}%` }} />
          </div>
          <p className="strength-label">{checkValue ? `${checkedStrength.label} · ~${checkedStrength.entropyBits} bits of entropy` : 'Nothing checked yet'}</p>

          <ul className="checklist">
            <li className={checkedStrength.checks.length8 ? 'pass' : ''}>At least 8 characters</li>
            <li className={checkedStrength.checks.length12 ? 'pass' : ''}>At least 12 characters</li>
            <li className={checkedStrength.checks.lower ? 'pass' : ''}>Contains a lowercase letter</li>
            <li className={checkedStrength.checks.upper ? 'pass' : ''}>Contains an uppercase letter</li>
            <li className={checkedStrength.checks.number ? 'pass' : ''}>Contains a number</li>
            <li className={checkedStrength.checks.symbol ? 'pass' : ''}>Contains a symbol</li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        Everything runs locally in your browser — nothing you type is sent anywhere · Built with React
      </footer>
    </>
  );
}
