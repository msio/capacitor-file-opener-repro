# capacitor-file-opener-repro

Minimal reproduction for `@capawesome-team/capacitor-file-opener` on iOS: when a view controller is
presented modally over the Capacitor bridge view controller, `openFile()` resolves but no preview is
shown. `documentInteractionControllerViewControllerForPreview` returns the bridge / key window root
view controller instead of the top-most presented one, so `UIDocumentInteractionController` presents
from a view controller that is already covered. Fix: [capawesome-team/capacitor-plugins#1068](https://github.com/capawesome-team/capacitor-plugins/pull/1068).

## Run

```bash
npm install
npm run build
npx cap sync ios
open ios/App/App.xcodeproj
```

Run on an iOS simulator, then tap:

- **Run control (no modal)** — writes a small PDF to the cache directory and calls `openFile()`.
  Expected and actual: the PDF preview appears.
- **Run repro (in-app browser presented)** — writes the same PDF, opens an in-app browser
  (`@capgo/capacitor-inappbrowser`), waits 2s, then calls the same `openFile()`. Expected: the PDF
  preview appears on top. Actual: nothing is shown, the in-app browser stays in front, and the log
  on the page shows that `openFile()` resolved.
- **Run double open** — writes `first.pdf` and `second.pdf`, calls `openFile()` for `first.pdf`, awaits
  it, waits 300 ms, then calls `openFile()` for `second.pdf`. `openFile()` resolves as soon as
  `presentPreview(animated:)` returns (~10 ms), before Quick Look shows the preview. Expected: the
  second call is rejected or waits until the first preview is dismissed. Actual: both calls resolve
  and two previews are stacked (`second` on top of `first`), so the user has to close both.

Verified with Capacitor 8.5.2, file-opener 8.0.5, Xcode 26.5, iPhone 17 simulator on iOS 26.2.
