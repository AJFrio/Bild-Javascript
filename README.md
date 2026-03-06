# bild-javascript

JavaScript SDK for the Bild External API.

## Install

```bash
npm install
```

## Quick start

```js
const { BildClient } = require('bild-javascript');

const client = new BildClient({ token: process.env.BILD_API_KEY });
const projects = await client.api.projects.list();
```

## Base URL

Default: `https://api.portle.io/api`

```js
const client = new BildClient({ token: process.env.BILD_API_KEY, baseUrl: 'https://api.portle.io/api' });
```

## Resource coverage

- `api.users`
- `api.projects`
- `api.projectUsers`
- `api.branchesCommits`
- `api.files`
- `api.fileUpload`
- `api.fileCheckinCheckout`
- `api.sharedLinks`
- `api.filesMoveDelete`
- `api.filesMetadata`
- `api.feedbackItems`
- `api.packages`
- `api.revisions`
- `api.approvals`
- `api.boms`
- `api.search`

## Escape hatch

```js
await client.get('projects');
await client.post('custom/path', { x: 1 });
```

## Smart defaults

For methods that require `branchId` and/or `fileVersion`, you can pass `null` and the SDK will auto-resolve:

- default branch: prefers `isMain`/`isDefault`, then `main`/`master`, then first branch
- file version: resolves from `latestFileVersion`

## Notes

The SDK is modular and easy to extend.
If your tenant/version has route differences, use low-level methods and add/adjust resource methods quickly.
