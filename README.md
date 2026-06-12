# Share the Love — Wedding Photo Upload Site

A one-page website where wedding guests upload their photos and videos
straight into the **WeddingPhotos** folder in Google Drive. Guests do not
need a Google account — they just open the site (for example by scanning a
QR code on the tables), optionally type their name, and tap **Upload
Photos & Videos**.

How the pieces fit together:

- **The website** (`index.html`) lives on Vercel. It shows the page and
  sends each file to Google Drive in small pieces, so big videos survive
  spotty cellphone signal.
- **A tiny Google script** (`apps-script/Code.gs`) runs inside the
  `bcwilson.wedding@gmail.com` Google account. Its only job is to open the
  "door" into the Drive folder for each file. The files themselves go
  directly from the guest's phone to Google Drive.

Setting it up takes four phases, about 20 minutes total. Do them in order.

---

## What you need before starting

- This repository pushed to GitHub (already done if you are reading this
  on github.com).
- A free account at [vercel.com](https://vercel.com) — sign up with the
  "Continue with GitHub" button so it can see this repository.
- The login for `bcwilson.wedding@gmail.com`.
- A folder named **WeddingPhotos** in that account's Google Drive (create
  it at [drive.google.com](https://drive.google.com) if it doesn't exist:
  **New → New folder**).

---

## Phase 1 — Put the site on Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New… → Project**.
3. Find **wilson-wedding** in the list of your GitHub repositories and
   click **Import**.
4. On the configuration screen, leave everything as it is:
   - **Framework Preset**: "Other" (it's a plain static page — there is
     nothing to build).
   - Don't change any other settings.
5. Click **Deploy** and wait about a minute.
6. When it finishes, Vercel shows your site's address, something like
   `https://wilson-wedding.vercel.app`. **Write this address down** — you
   need it in Phase 2.

The site is live now, but the upload button won't work yet — that's what
Phases 2 and 3 fix.

---

## Phase 2 — Create the Google script (the "door opener")

Do all of this signed in as **bcwilson.wedding@gmail.com**.

1. **Find your folder ID.** Open [drive.google.com](https://drive.google.com)
   and double-click the **WeddingPhotos** folder. Look at the address bar:

   ```
   https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ12345
                                          \_______________________________/
                                              this part is the folder ID
   ```

   Copy everything after the last `/`. That is the **folder ID**.

2. Go to [script.google.com](https://script.google.com) and click
   **New project**.

3. Give the project a name: click "Untitled project" at the top and call
   it `Share the Love`.

4. **Turn on the manifest file.** Click the gear icon (**Project
   Settings**) in the left sidebar and tick
   **"Show 'appsscript.json' manifest file in editor"**. Then click the
   **Editor** icon (`< >`) to go back to the code.

5. You now see two files in the left file list: `Code.gs` and
   `appsscript.json`.
   - Click `appsscript.json`, delete everything in it, and paste in the
     full contents of `apps-script/appsscript.json` from this repository.
     (If your wedding is not in the US Eastern time zone, change the
     `"timeZone"` line — it controls the date/time stamped onto each
     uploaded file's name. Find your zone name at
     [en.wikipedia.org/wiki/List_of_tz_database_time_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).)
   - Click `Code.gs`, delete everything in it, and paste in the full
     contents of `apps-script/Code.gs` from this repository.

6. Near the top of `Code.gs`, fill in the two settings:
   - Replace `PASTE_FOLDER_ID_HERE` with the folder ID from step 1.
   - Replace `PASTE_VERCEL_DOMAIN_HERE` with your Vercel address from
     Phase 1 — **including** `https://` and **without** a trailing slash.
     Example: `https://wilson-wedding.vercel.app`

   Keep the quotes around both values. Press **Ctrl+S** (Cmd+S on Mac) to
   save.

7. **Deploy it.** Click the blue **Deploy** button (top right) →
   **New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - **Description**: anything, e.g. `v1`.
   - **Execute as**: **Me (bcwilson.wedding@gmail.com)** — important.
   - **Who has access**: **Anyone** — important. (This only lets people
     *ask the script to open an upload session* — nobody can read or
     browse your Drive through it.)
   - Click **Deploy**.

8. **Authorize it.** Google now asks for permission:
   - Click **Authorize access**, pick `bcwilson.wedding@gmail.com`.
   - You'll see a scary screen saying **"Google hasn't verified this
     app"**. That's expected — *you* are the developer of this app. Click
     **Advanced**, then **"Go to Share the Love (unsafe)"**, then
     **Allow**.

9. When the deployment finishes, Google shows a **Web app URL** that ends
   in `/exec`. Click **Copy**. **This URL is the prize of Phase 2** —
   you need it in Phase 3.

   Quick check: paste that URL into a browser tab. You should see a short
   line of text containing `"status":"ok"`. If you do, the script is live.

---

## Phase 3 — Connect the site to the script

You'll make a one-line edit to `index.html`. The easiest way is directly
on GitHub:

1. Open this repository on [github.com](https://github.com) and click on
   `index.html`.
2. Click the **pencil icon** (Edit this file) at the top right of the
   file view.
3. Find this line near the top of the `<script>` section
   (around line 175):

   ```js
   const APPS_SCRIPT_URL = "PASTE_WEB_APP_URL_HERE";
   ```

   Replace `PASTE_WEB_APP_URL_HERE` with the Web app URL you copied in
   Phase 2, keeping the quotes:

   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```

4. Click **Commit changes…** (green button), then **Commit changes**
   again in the dialog.
5. Vercel notices the change and redeploys automatically. After about a
   minute, open your Vercel address on your phone — the upload button now
   works.

---

## Phase 4 — Test checklist

Test on real phones over **cellular** (turn Wi-Fi off), because that's
how guests will use it at the venue.

**iPhone (Safari, Wi-Fi off):**

- [ ] Upload 1 photo — progress bar runs to 100%, then shows ✓ Done!
- [ ] Upload 3 photos at once — they upload one after another, each gets
      its own progress bar and ✓ Done!
- [ ] Upload 1 long 4K video (over 100 MB) — the bar moves steadily and
      finishes. This can take several minutes on cellular; keep the page
      open.

**Android (Chrome, Wi-Fi off):**

- [ ] Same three tests as above.

**In Google Drive (as bcwilson.wedding@gmail.com):**

- [ ] All test files appear in **WeddingPhotos**.
- [ ] Each filename starts with a date-time stamp, like
      `2026-07-18T19-22-03_Karissa_IMG_1234.HEIC`, and includes the name
      you typed in the "Your name" box.

**Failure handling:**

- [ ] Start uploading a big video, then flip airplane mode **on for ~30
      seconds and back off** mid-upload. The upload should pause, retry,
      and still finish on its own (it keeps retrying each piece for
      about two minutes and resumes the moment the signal returns).
- [ ] Keep airplane mode on for several minutes, until the file shows
      red **"Failed — tap to retry"**. Turn the network back on and
      **tap that line** — the upload should pick up from where it
      stopped, without re-picking the file.

---

## If something goes wrong

- **Button does nothing / instantly fails** — Phase 3 wasn't done, or the
  URL was pasted wrong. View `index.html` on GitHub and check the
  `APPS_SCRIPT_URL` line: it must be the `/exec` URL inside quotes.
- **Every upload fails immediately** — check `ALLOWED_ORIGIN` in the
  Apps Script: it must match your Vercel address exactly
  (`https://`, no trailing slash, no typos).
- **Files don't appear in Drive** — check `FOLDER_ID` in the Apps
  Script, and make sure you authorized the script as
  `bcwilson.wedding@gmail.com` in Phase 2 step 8.
- **You changed `Code.gs` later and nothing happened** — Apps Script
  changes only go live after you publish a new version: **Deploy →
  Manage deployments → ✏️ (edit) → Version: New version → Deploy**. (The
  URL stays the same, so you don't need to touch `index.html` again.)
