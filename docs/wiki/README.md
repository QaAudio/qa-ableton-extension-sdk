# Wiki source files

Markdown here is the **source of truth** for the [GitHub wiki](https://github.com/QaAudio/qa-ableton-extension-sdk/wiki).

## Publish to GitHub wiki

From a clone with wiki push access:

```bash
git clone https://github.com/QaAudio/qa-ableton-extension-sdk.wiki.git
cd qa-ableton-extension-sdk.wiki
cp ../qa-ableton-extension-sdk/docs/wiki/Home.md Home.md
cp ../qa-ableton-extension-sdk/docs/wiki/Quick-Start.md Quick-Start.md
git add -A
git commit -m "docs: sync quick start from main repo"
git push
```

Keep `docs/quick-start.md` in the main repo in sync when you edit the wiki guide.
