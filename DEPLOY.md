# Deploy or embed Inkfang

The game is a static website: no build, paid API key, database, or Node server is needed for hosting. The complete playable app is in `dist/`. All links to its scripts and images are relative, so it works at a domain root or a subfolder such as `/inkfang/`.

## GitHub Pages

1. Unzip the package. Create a GitHub repository for the game. GitHub Free supports Pages for public repositories; availability for private repositories depends on your plan.
2. Upload the **contents of the `inkfang` folder** to the repository root. Include `dist/`, `tests/`, and the hidden `.github/workflows/pages.yml` file. Do not upload the ZIP as a single file. If Finder hides `.github`, press Command–Shift–Period to show it. GitHub Desktop is another way to publish the whole folder.
3. Use `main` as the repository's default branch. If you use another name, change the branch in `.github/workflows/pages.yml`.
4. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Open **Actions → Publish Inkfang to GitHub Pages → Run workflow**. Later pushes to `main` redeploy automatically. The workflow runs the game checks, then publishes `dist/`.
6. When the run succeeds, open the URL shown under Settings → Pages. It is normally `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

For a terminal-based upload, run these commands from inside the extracted `inkfang` folder, replacing the example repository URL with your own:

```sh
git init
git add .
git commit -m "Add Inkfang learning game"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

These steps prepare your own repository. This delivery does not create a GitHub repository or change the existing Site's audience.

GitHub's guide: [Use custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Other website hosting

Upload **everything inside `dist/`** into the folder your host serves, for example `/public_html/inkfang/`. `index.html` must sit directly inside that served folder, beside `app.js`, the stylesheets, and `assets/`. Keep all files and folder names unchanged. Use an HTTPS address. Opening `index.html` by double-clicking it is not a reliable microphone setup.

For a local preview, serve the repository folder over HTTP:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080/dist/` for the game or `http://localhost:8080/examples/embed.html` for the embed example. Localhost is suitable for microphone permission testing; another computer's plain HTTP address is not.

## Embed in an existing website

Host the game first, then paste the following into an HTML block on your website. Replace both example URLs with your game's actual HTTPS URL.

```html
<iframe
  src="https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/"
  title="Inkfang English learning game"
  allow="microphone; autoplay; fullscreen"
  allowfullscreen
  style="display:block;width:100%;height:900px;height:90svh;min-height:600px;border:0;"
></iframe>
<p>
  <a href="https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/"
     target="_blank" rel="noopener">
    Open Inkfang in its own tab
  </a>
</p>
```

The included `examples/embed.html` shows a working local embed. When copying it to another host, replace its `../dist/` iframe and link addresses with the hosted game URL.

For speaking, both the parent website and game should use HTTPS. The iframe's `allow="microphone"` delegates microphone access; students still grant browser permission themselves. A parent website's Permissions Policy can still block the microphone. If the host applies a restrictive policy, its administrator must allow the game's origin. Avoid adding a sandbox attribute to this example: sandbox restrictions can stop scripts, storage, exports, or microphone permission. Some site builders remove iframe permission attributes, and some browsers restrict speech inside frames. Keep the “open in its own tab” link as a fallback.

Music starts after a student starts a run; browsers do not allow unsolicited background audio. The game pauses when its tab loses focus.

Reference: [MDN iframe permissions](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#allow).

## Classroom setup and speech limits

- Typing: switch to an English keyboard and turn off UniKey / Vietnamese input before playing. The game respects composition, so it cannot attack with text the keyboard has not committed yet. Number answers require digits, not written number words.
- Speaking: choose English UK or US, then use **Check microphone** before a match. Try “four”, “letter B”, and “ninety-eight”. The separate browser transcript shows what the recognition service returned. Headphones help prevent music or other students' voices from entering the microphone.
- Speak mode needs SpeechRecognition / webkitSpeechRecognition plus microphone access. An unavailable API disables Speak; Type remains available. Microphone permission, the browser service, connectivity, and the speaker's environment still affect accuracy and latency.
- Inkfang saves no audio. The browser's recognition service may send audio online. Microsoft documents that Edge's Web Speech implementation uses Azure Cognitive Services. No cloud speech account or API key is bundled in this static package.
- This is recognition-based speaking practice, not a validated pronunciation assessment.
- Best scores, guide history, and teacher-added questions are saved only in that browser. They do not sync across devices or transfer automatically from the existing Site to a GitHub Pages domain. Export custom questions from Question bank and import them on the new domain.
- The 1,237 built-in questions ship as JSON/CSV in `dist/`. Fonts load from Google Fonts when online, with system-font fallbacks. Game art, guide images, music generation, and sound effects ship with the app.

References: [Microsoft Edge speech policy](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/SpeechRecognitionEnabled), [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).

## Checks and editing

Edit the files in `dist/` directly. There is no build step or package installation. Optional automated checks require Node.js and run with:

```sh
node --test tests/*.test.cjs
```

The regression checks cover number homophones, compound numbers, letter-name batches, alternative transcript revisions, duplicate attack prevention, typing timing, microphone lifecycle, voice pacing, audio, and guide content. They exercise recognition callbacks with fixtures; they do not establish real-world microphone accuracy for every speaker, browser, device, or embedded host. The GitHub workflow has been prepared but has not been run against your own repository.
