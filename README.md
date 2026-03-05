# bild-javascript

Clean JavaScript SDK for the Bild External API.

## Install

```bash
npm install
```

## Quick start

```js
const { BildClient } = require('bild-javascript');

const client = new BildClient({ token: process.env.BILD_API_KEY });

const projects = await client.api.projects.list();
const users = await client.api.users.list();
```

## Base URL

Default:

- `https://api.portle.io/api`

Override:

```js
const client = new BildClient({
  token: process.env.BILD_API_KEY,
  baseUrl: 'https://api.portle.io/api'
});
```

## Implemented modules

- `api.users`
  - `list()`
  - `add({ emails, role = 'Member', projects = [] })`
- `api.projects`
  - `list()`
  - `users(projectId)`
  - `files(projectId)`
- `api.files`
  - `latestVersion(projectId, branchId, fileId)`
  - `toSTL(projectId, branchId, fileId, fileVersion)`
  - `toSTEP(projectId, branchId, fileId, fileVersion)`
- `api.metadata`
  - `fields()`
  - `fileMetadata(projectId, branchId, fileId)`
- `api.search`
  - `query(payload)`

## Low-level escape hatch

```js
await client.get('projects');
await client.post('some/path', { x: 1 });
```

## Notes

This SDK was rebuilt from scratch and focuses on a stable core + easy extension.
If an endpoint path differs in your tenant/version, use low-level methods and extend resource methods quickly.
