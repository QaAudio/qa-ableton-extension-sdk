# Ableton Extensions SDK (local install)

Ableton does **not** publish `@ableton-extensions/sdk` on public npm. Download the SDK from the [Extensions SDK site](https://ableton.github.io/extensions-sdk/) and install the tarballs into your extension project.

## Typical layout

Place the extracted `.tgz` files here (optional — any path works):

```
vendor/
├── ableton-extensions-sdk-1.0.0-beta.0.tgz
└── ableton-extensions-cli-1.0.0-beta.0.tgz
```

## Install into the starter example

```bash
cd examples/starter-extension
npm install ../../vendor/ableton-extensions-sdk-1.0.0-beta.0.tgz
npm install -D ../../vendor/ableton-extensions-cli-1.0.0-beta.0.tgz
```

Do **not** commit Ableton's SDK archives to public repos unless your license allows it. This folder is gitignored except for this README.
