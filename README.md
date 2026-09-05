# Password Generator

Generate strong random passwords and check the strength of any
password — entirely in your browser. Nothing you type or generate is
ever sent anywhere.

## Features

- Customizable length, character sets (uppercase, lowercase, numbers,
  symbols) and an "exclude ambiguous characters" option
- Passwords are generated with `crypto.getRandomValues`, not
  `Math.random`
- One-click copy to clipboard
- A separate strength checker: paste in any password and see an
  entropy-based strength score plus a live criteria checklist
- Light / dark theme toggle

## Stack

React 18 + Vite, deployed as a static site on GitHub Pages (built into
`docs/`).

## Run locally

```
npm install
npm run dev
```

## Build for production

```
npm run build
```

Outputs to `docs/`, matching the GitHub Pages source configured for
this repo.
