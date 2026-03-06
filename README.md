# Bild-Javascript

JavaScript/Node library for interacting with the Bild External API.

> This repo is currently intended to be used directly from source (not published to npm yet).

## 1) Clone and install

```bash
git clone https://github.com/AJFrio/Bild-Javascript.git
cd Bild-Javascript
npm install
```

## 2) Set your API token

```bash
export BILD_API_KEY="YOUR_JWT_TOKEN"
```

Or pass token directly in code.

## 3) Basic usage

```js
const { BildClient } = require('./src');

const client = new BildClient(); // uses BILD_API_KEY from env
// or: const client = new BildClient({ token: 'YOUR_JWT_TOKEN' });

(async () => {
  const projects = await client.api.projects.list();
  console.log(projects);
})();
```

---

## Common examples

### List users and projects

```js
const { BildClient } = require('./src');
const client = new BildClient();

(async () => {
  const users = await client.api.users.list();
  const projects = await client.api.projects.list();

  console.log('Users:', users);
  console.log('Projects:', projects);
})();
```

### Add users to your account

```js
await client.api.users.add({
  emails: ['person@example.com'],
  role: 'Member',
  projects: [{ id: 'project-id', projectAccess: 'Editor' }]
});
```

### List files in a project

```js
const files = await client.api.files.list('project-id');
console.log(files);
```

### Convert file to STEP (auto-default branch + latest version)

```js
const result = await client.api.files.universalFormat(
  'project-id',
  null,            // auto-resolves main/default branch
  'file-id',
  {
    fileVersion: null,  // auto-resolves latest file version
    outputFormat: 'step'
  }
);
console.log(result);
```

### Shared links

```js
const links = await client.api.sharedLinks.list('project-id');
console.log(links);

const newLink = await client.api.sharedLinks.create('project-id', {
  name: 'Review Link',
  fileIds: ['file-id']
});
console.log(newLink);
```

### Search

```js
const search = await client.api.search.query({ query: 'bolt' });
console.log(search);
```

---

## API groups available

- `client.api.users`
- `client.api.projects`
- `client.api.projectUsers`
- `client.api.branchesCommits`
- `client.api.files`
- `client.api.fileUpload`
- `client.api.fileCheckinCheckout`
- `client.api.sharedLinks`
- `client.api.filesMoveDelete`
- `client.api.filesMetadata`
- `client.api.feedbackItems`
- `client.api.packages`
- `client.api.revisions`
- `client.api.approvals`
- `client.api.boms`
- `client.api.search`

---

## Advanced: custom base URL

```js
const client = new BildClient({
  token: process.env.BILD_API_KEY,
  baseUrl: 'https://api.portle.io/api'
});
```

## Escape hatch for unwrapped endpoints

```js
const raw = await client.get('projects');
console.log(raw);
```
