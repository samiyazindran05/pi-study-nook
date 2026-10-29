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
- Play user-supplied YouTube links through the official IFrame API, so end-of-video masking follows actual playback state without simulated search results.
