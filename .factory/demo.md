# Demo sandbox

- URL: `https://package-cost-explorer.sociobot.in/demo` or `/?demo=1`.
- Sample: a completed `date-fns@4.1.0` report with installed size, production
  dependency count, three package entry points, bundle sizes, named imports,
  and version history.
- Reset: choose **Reset demo** in the persistent demo banner.
- Exit: choose **Start for real**. The real package form opens empty.
- Isolation: sample state exists only in JavaScript memory. Reset removes only
  browser-storage keys that start with `demo:`. The demo never reads or writes
  other keys and does not contact npm.

Run `npm run test:claims` to verify the demo and every public claim from fresh
browser contexts.
