# Demo sandbox

- URL: `https://package-cost-explorer.sociobot.in/demo` or `/?demo=1`.
- Sample: a completed `date-fns@4.1.0` report with installed size, three package
  entry points, compressed JavaScript sizes, named imports, and version history.
- Reset: choose **Reset demo** in the persistent demo banner.
- Exit: choose **Start for real**. The real package form opens empty.
- Isolation: sample state exists only in JavaScript memory. The reserved
  `demo:` localStorage and sessionStorage namespaces are cleared by reset; the
  demo never reads or writes non-demo keys. It does not contact npm.

Run `npm run test:claims` to verify the demo and every public claim from fresh
browser contexts.
