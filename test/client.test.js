const test = require('node:test');
const assert = require('node:assert/strict');
const { BildClient } = require('../src');

function makeClient() {
  const client = new BildClient({ token: 'test-token' });
  const calls = [];

  client.request = async (method, path, { params, data } = {}) => {
    calls.push({ method, path, params, data });

    if (path.endsWith('/branches')) {
      return { data: [{ id: 'branch-main', isMain: true }] };
    }
    if (path.endsWith('/latestFileVersion')) {
      return { data: { fileVersion: 'v-latest' } };
    }

    return { ok: true };
  };

  client.get = (path, params) => client.request('GET', path, { params });
  client.post = (path, data, params) => client.request('POST', path, { data, params });
  client.put = (path, data, params) => client.request('PUT', path, { data, params });
  client.delete = (path, params) => client.request('DELETE', path, { params });

  return { client, calls };
}

test('users routes', async () => {
  const { client, calls } = makeClient();
  await client.api.users.list();
  assert.equal(calls.at(-1).path, 'users');

  await client.api.users.add({ emails: ['a@example.com'] });
  assert.equal(calls.at(-1).method, 'PUT');
  assert.equal(calls.at(-1).path, 'users/add');
});

test('projects + project users routes', async () => {
  const { client, calls } = makeClient();
  await client.api.projects.list();
  assert.equal(calls.at(-1).path, 'projects');

  await client.api.projectUsers.list('p1');
  assert.equal(calls.at(-1).path, 'projects/p1/users');

  await client.api.projectUsers.add('p1', { userId: 'u1' });
  assert.equal(calls.at(-1).method, 'POST');
  assert.equal(calls.at(-1).path, 'projects/p1/users');

  await client.api.projectUsers.update('p1', 'u1', { role: 'Editor' });
  assert.equal(calls.at(-1).path, 'projects/p1/users/u1');
});

test('branches & commits routes', async () => {
  const { client, calls } = makeClient();
  await client.api.branchesCommits.listBranches('p1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches');

  await client.api.branchesCommits.branch('p1', 'b1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1');

  await client.api.branchesCommits.commits('p1', 'b1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/commits');

  await client.api.branchesCommits.commit('p1', 'b1', 'c1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/commits/c1');
});

test('files routes + default resolution', async () => {
  const { client, calls } = makeClient();
  await client.api.files.list('p1');
  assert.equal(calls.at(-1).path, 'projects/p1/files');

  await client.api.files.list('p1', 'b1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files');

  await client.api.files.get('p1', null, 'f1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/branch-main/files/f1');

  await client.api.files.latestVersion('p1', null, 'f1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/branch-main/files/f1/latestFileVersion');

  await client.api.files.universalFormat('p1', null, 'f1', { outputFormat: 'stl', fileVersion: null });
  assert.equal(calls.at(-1).path, 'projects/p1/branches/branch-main/files/f1/universalFormat');
  assert.equal(calls.at(-1).data.fileVersion, 'v-latest');
});

test('file upload/checkin/checkout routes', async () => {
  const { client, calls } = makeClient();
  await client.api.fileUpload.initUpload('p1', 'b1', { name: 'x' });
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/fileUpload');

  await client.api.fileUpload.completeUpload('p1', 'b1', { id: 'upload1' });
  assert.equal(calls.at(-1).method, 'POST');

  await client.api.fileCheckinCheckout.checkout('p1', 'b1', 'f1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files/f1/checkout');

  await client.api.fileCheckinCheckout.checkin('p1', 'b1', 'f1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files/f1/checkin');

  await client.api.fileCheckinCheckout.discardCheckout('p1', 'b1', 'f1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files/f1/discardCheckout');

  await client.api.fileCheckinCheckout.createVersion('p1', 'b1', 'f1', { message: 'v2' });
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files/f1/versions');
});

test('shared links + move/delete + metadata routes', async () => {
  const { client, calls } = makeClient();
  await client.api.sharedLinks.list('p1');
  assert.equal(calls.at(-1).path, 'projects/p1/sharedLinks');

  await client.api.sharedLinks.get('p1', 's1');
  assert.equal(calls.at(-1).path, 'projects/p1/sharedLinks/s1');

  await client.api.sharedLinks.create('p1', { x: 1 });
  assert.equal(calls.at(-1).method, 'POST');

  await client.api.sharedLinks.update('p1', 's1', { x: 2 });
  assert.equal(calls.at(-1).method, 'PUT');

  await client.api.filesMoveDelete.move('p1', 'b1', { ids: ['f1'] });
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files/move');

  await client.api.filesMoveDelete.deleteMany('p1', 'b1', { ids: ['f1'] });
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files/delete');

  await client.api.filesMetadata.fields();
  assert.equal(calls.at(-1).path, 'metadataFields');

  await client.api.filesMetadata.fileMetadata('p1', 'b1', 'f1');
  assert.equal(calls.at(-1).path, 'projects/p1/branches/b1/files/f1/metadata');

  await client.api.filesMetadata.updateFileMetadata('p1', 'b1', 'f1', { a: 1 });
  assert.equal(calls.at(-1).method, 'PUT');
});

test('feedback/packages/revisions/approvals/boms/search routes', async () => {
  const { client, calls } = makeClient();

  await client.api.feedbackItems.list('p1');
  assert.equal(calls.at(-1).path, 'projects/p1/feedbackItems');
  await client.api.feedbackItems.get('p1', 'i1');
  await client.api.feedbackItems.create('p1', { x: 1 });
  await client.api.feedbackItems.update('p1', 'i1', { x: 2 });
  await client.api.feedbackItems.delete('p1', 'i1');

  await client.api.packages.list('p1');
  assert.equal(calls.at(-1).path, 'projects/p1/packages');
  await client.api.packages.get('p1', 'pkg1');

  await client.api.revisions.list('p1', 'b1', 'f1');
  await client.api.revisions.get('p1', 'b1', 'f1', 'r1');
  await client.api.revisions.restore('p1', 'b1', 'f1', 'r1');

  await client.api.approvals.list('p1');
  await client.api.approvals.get('p1', 'a1');
  await client.api.approvals.update('p1', 'a1', { status: 'approved' });

  await client.api.boms.list('p1');
  await client.api.boms.get('p1', 'bom1');
  await client.api.boms.create('p1', { x: 1 });

  await client.api.search.query({ query: 'bolt' });
  assert.equal(calls.at(-1).path, 'search');
  assert.equal(calls.at(-1).method, 'PUT');
});
