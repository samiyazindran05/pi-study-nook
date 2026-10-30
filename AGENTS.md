<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the shared StudyLibrary provider for all sorted notes and subject folders, scoped to the signed-in user, so lecture and standalone notes have one storage path.
- Keep PDF.js dynamically loaded in the browser and store PDFs in private user-prefixed Cloud Storage paths, so SSR stays safe and files remain private.
- Lecture search returns a fixed demo catalog and plays picks through the official YouTube IFrame API, so the demo works offline from a search API while end-of-video masking follows real playback state.
- Merge saves whose normalized title matches an existing note into that note as numbered entries, so topics never duplicate.
