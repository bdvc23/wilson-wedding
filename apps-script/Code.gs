/**
 * "Share the Love" — token broker.
 *
 * Guests' browsers POST file metadata here; this script opens a Google
 * Drive resumable upload session under the wedding Google account and
 * hands the session URI back. The browser then uploads the file bytes
 * straight to Drive — guests never need a Google account.
 *
 * Deploy as a Web App: Execute as Me, Who has access: Anyone.
 * OAuth scopes are declared in appsscript.json (drive +
 * script.external_request), so no dummy DriveApp call is needed here.
 */

// =====================================================================
// CONFIG
// =====================================================================
const FOLDER_ID = "PASTE_FOLDER_ID_HERE";          // the WeddingPhotos folder in Drive
const ALLOWED_ORIGIN = "PASTE_VERCEL_DOMAIN_HERE"; // e.g. https://wilson-wedding.vercel.app

function doPost(e) {
  try {
    // Fail loudly if the config above was never filled in. A bogus
    // ALLOWED_ORIGIN would otherwise succeed here and only break later,
    // invisibly, when the browser's chunk uploads fail CORS.
    if (FOLDER_ID.indexOf('PASTE_') === 0 || ALLOWED_ORIGIN.indexOf('PASTE_') === 0) {
      return jsonOutput({ error: 'Script not configured: fill in FOLDER_ID and ALLOWED_ORIGIN at the top of Code.gs' });
    }

    const body = JSON.parse(e.postData.contents);
    const filename = String(body.filename || 'upload');
    const mimeType = String(body.mimeType || 'application/octet-stream');
    const size = Number(body.size) || 0;
    const guestName = sanitizeName(String(body.guestName || ''));

    // Prefix: 2026-07-18T19-22-03_Karissa_IMG_1234.HEIC
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH-mm-ss");
    const driveName = stamp + (guestName ? '_' + guestName : '') + '_' + filename;

    const response = UrlFetchApp.fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method: 'post',
        contentType: 'application/json; charset=UTF-8',
        headers: {
          'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(),
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': String(size),
          // CRITICAL: setting Origin on the session initiation is what
          // makes Drive answer CORS for the browser's chunk PUTs to the
          // session URI. Without it every chunk upload fails. A trailing
          // slash would break the origin match, so strip it defensively.
          'Origin': ALLOWED_ORIGIN.replace(/\/+$/, '')
        },
        payload: JSON.stringify({ name: driveName, parents: [FOLDER_ID] }),
        muteHttpExceptions: true
      }
    );

    if (response.getResponseCode() !== 200) {
      return jsonOutput({
        error: 'Drive API error ' + response.getResponseCode() + ': ' + response.getContentText()
      });
    }

    // The session URI arrives in the Location response header.
    const headers = response.getAllHeaders();
    const sessionUri = headers['Location'] || headers['location'];
    if (!sessionUri) {
      return jsonOutput({ error: 'Drive API did not return a session URI' });
    }

    return jsonOutput({ sessionUri: sessionUri });
  } catch (err) {
    return jsonOutput({ error: String(err) });
  }
}

// Visiting the /exec URL in a browser hits doGet — handy as a smoke test
// that the deployment is live and reachable.
function doGet() {
  return jsonOutput({ status: 'ok', service: 'Share the Love token broker' });
}

// Keep guest names filesystem-friendly: letters/digits/underscores/dashes,
// spaces collapsed to dashes, capped at 40 characters.
function sanitizeName(name) {
  return name.replace(/[^\w \-]/g, '').trim().replace(/\s+/g, '-').slice(0, 40);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
