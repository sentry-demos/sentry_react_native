# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Empower TDA dependency

This app is the React Native "Empower Plant" demo. Beyond live demos, its **release builds** are
consumed by the **empower TDA** (Test Data Automation) pipeline, which generates Sentry demo data.
Keep this in mind when changing behavior, testIDs, or the release process.

## Where TDA lives

- Repo `sentry-demos/empower`, directory `_tda/`. It runs automated tests (Selenium/Appium/Maestro)
  against the demo apps on a GCP host and sends events to Sentry.
- The suites covering this app are `_tda/mobile_native/android_react_native/` (e.g.
  `test_checkout_react_native_android.py`) and `_tda/mobile_native/ios_react_native/`.

## How TDA picks this app's build

- `_tda/release_version_manager.py` resolves the **newest GitHub release tag** of
  `sentry-demos/sentry_react_native` (`GET /repos/.../releases` -> `releases[0].tag_name`).
- It prefers the env var `LATEST_REACT_NATIVE_GITHUB_RELEASE`, which `_tda/entrypoint.sh` sets
  **once at process start** (to avoid GitHub API rate limits).
- The build is downloaded from that tag:
  - Android: `https://github.com/sentry-demos/sentry_react_native/releases/download/<tag>/app-release.apk`
  - iOS: `.../download/<tag>/sentry_react_native.app.zip`

## Releases

- `.github/workflows/release.yml` publishes date-based releases (`YY.M.D`, suffixed `-1`, `-2`, ... on
  collision), builds the APK + iOS app, and attaches them to a GitHub Release.
- `EXPO_PUBLIC_SE` must be `tda` for release builds (see `github_release.sh`); it is inlined as the
  `se` tag used by TDA and demo dashboards.

## Gotchas for future agents

- **TDA only sees a new release when `_tda` is redeployed.** The version is cached in
  `LATEST_REACT_NATIVE_GITHUB_RELEASE` at startup; a fresh release isn't used until `_tda` restarts
  (empower's auto-deploy only redeploys `_tda` when its code changes, or via a manual
  `workflow_dispatch` with `project: _tda`).
- **UI selectors matter.** TDA drives the app by accessibility id / visible text (e.g.
  `bottom-tab-cart`, "Add to cart", "Place your order", "Checkout"). Renaming them breaks TDA.
- **Drafts are invisible.** TDA reads `releases[0]`; draft releases are excluded from the GitHub
  releases API and won't be picked up.
