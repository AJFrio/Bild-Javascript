const axios = require('axios');
const { BildApiError, BildAuthError } = require('./errors');

const DEFAULT_BASE_URL = 'https://api.portle.io/api';

class BildClient {
  constructor({ token = process.env.BILD_API_KEY, baseUrl = DEFAULT_BASE_URL, timeout = 30000 } = {}) {
    if (!token) throw new Error('Missing token. Pass { token } or set BILD_API_KEY');

    this.http = axios.create({
      baseURL: baseUrl.replace(/\/$/, ''),
      timeout,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });

    this.api = {
      users: new UsersAPI(this),
      projects: new ProjectsAPI(this),
      projectUsers: new ProjectUsersAPI(this),
      branchesCommits: new BranchesCommitsAPI(this),
      files: new FilesAPI(this),
      fileUpload: new FileUploadAPI(this),
      fileCheckinCheckout: new FileCheckinCheckoutAPI(this),
      sharedLinks: new SharedLinksAPI(this),
      filesMoveDelete: new FilesMoveDeleteAPI(this),
      filesMetadata: new FilesMetadataAPI(this),
      feedbackItems: new FeedbackItemsAPI(this),
      packages: new PackagesAPI(this),
      revisions: new RevisionsAPI(this),
      approvals: new ApprovalsAPI(this),
      boms: new BOMsAPI(this),
      search: new SearchAPI(this)
    };
  }

  async request(method, path, { params, data } = {}) {
    try {
      const res = await this.http.request({ method, url: `/${path.replace(/^\//, '')}`, params, data });
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      const payload = err?.response?.data;
      if (status === 401 || status === 403) {
        throw new BildAuthError('Authentication/authorization failed', status, payload);
      }
      throw new BildApiError(`API error ${status || 'unknown'}`, status, payload || err.message);
    }
  }

  get(path, params) { return this.request('GET', path, { params }); }
  post(path, data, params) { return this.request('POST', path, { params, data }); }
  put(path, data, params) { return this.request('PUT', path, { params, data }); }
  delete(path, params) { return this.request('DELETE', path, { params }); }
}

class UsersAPI {
  constructor(client) { this.client = client; }
  list() { return this.client.get('users'); }
  add({ emails, role = 'Member', projects = [] }) {
    return this.client.put('users/add', { emails, role, projects });
  }
}

class ProjectsAPI {
  constructor(client) { this.client = client; }
  list() { return this.client.get('projects'); }
}

class ProjectUsersAPI {
  constructor(client) { this.client = client; }
  list(projectId) { return this.client.get(`projects/${projectId}/users`); }
  add(projectId, payload) { return this.client.post(`projects/${projectId}/users`, payload); }
  update(projectId, userId, payload) { return this.client.put(`projects/${projectId}/users/${userId}`, payload); }
}

class BranchesCommitsAPI {
  constructor(client) { this.client = client; }
  listBranches(projectId) { return this.client.get(`projects/${projectId}/branches`); }
  branch(projectId, branchId) { return this.client.get(`projects/${projectId}/branches/${branchId}`); }
  commits(projectId, branchId) { return this.client.get(`projects/${projectId}/branches/${branchId}/commits`); }
  commit(projectId, branchId, commitId) { return this.client.get(`projects/${projectId}/branches/${branchId}/commits/${commitId}`); }
}

class FilesAPI {
  constructor(client) { this.client = client; }
  list(projectId, branchId = null) {
    if (branchId) return this.client.get(`projects/${projectId}/branches/${branchId}/files`);
    return this.client.get(`projects/${projectId}/files`);
  }
  get(projectId, branchId, fileId) { return this.client.get(`projects/${projectId}/branches/${branchId}/files/${fileId}`); }
  latestVersion(projectId, branchId, fileId) {
    return this.client.get(`projects/${projectId}/branches/${branchId}/files/${fileId}/latestFileVersion`);
  }
  universalFormat(projectId, branchId, fileId, { fileVersion, outputFormat }) {
    return this.client.post(`projects/${projectId}/branches/${branchId}/files/${fileId}/universalFormat`, {
      fileVersion,
      universalFileFormat: outputFormat
    });
  }
}

class FileUploadAPI {
  constructor(client) { this.client = client; }
  initUpload(projectId, branchId, payload) { return this.client.put(`projects/${projectId}/branches/${branchId}/fileUpload`, payload); }
  completeUpload(projectId, branchId, payload) { return this.client.post(`projects/${projectId}/branches/${branchId}/fileUpload`, payload); }
}

class FileCheckinCheckoutAPI {
  constructor(client) { this.client = client; }
  checkout(projectId, branchId, fileId, payload = {}) { return this.client.put(`projects/${projectId}/branches/${branchId}/files/${fileId}/checkout`, payload); }
  checkin(projectId, branchId, fileId, payload = {}) { return this.client.put(`projects/${projectId}/branches/${branchId}/files/${fileId}/checkin`, payload); }
  discardCheckout(projectId, branchId, fileId, payload = {}) { return this.client.put(`projects/${projectId}/branches/${branchId}/files/${fileId}/discardCheckout`, payload); }
  createVersion(projectId, branchId, fileId, payload) { return this.client.post(`projects/${projectId}/branches/${branchId}/files/${fileId}/versions`, payload); }
}

class SharedLinksAPI {
  constructor(client) { this.client = client; }
  list(projectId) { return this.client.get(`projects/${projectId}/sharedLinks`); }
  get(projectId, linkId) { return this.client.get(`projects/${projectId}/sharedLinks/${linkId}`); }
  create(projectId, payload) { return this.client.post(`projects/${projectId}/sharedLinks`, payload); }
  update(projectId, linkId, payload) { return this.client.put(`projects/${projectId}/sharedLinks/${linkId}`, payload); }
}

class FilesMoveDeleteAPI {
  constructor(client) { this.client = client; }
  move(projectId, branchId, payload) { return this.client.put(`projects/${projectId}/branches/${branchId}/files/move`, payload); }
  deleteMany(projectId, branchId, payload) { return this.client.put(`projects/${projectId}/branches/${branchId}/files/delete`, payload); }
}

class FilesMetadataAPI {
  constructor(client) { this.client = client; }
  fields() { return this.client.get('metadataFields'); }
  fileMetadata(projectId, branchId, fileId) { return this.client.get(`projects/${projectId}/branches/${branchId}/files/${fileId}/metadata`); }
  updateFileMetadata(projectId, branchId, fileId, payload) { return this.client.put(`projects/${projectId}/branches/${branchId}/files/${fileId}/metadata`, payload); }
}

class FeedbackItemsAPI {
  constructor(client) { this.client = client; }
  list(projectId) { return this.client.get(`projects/${projectId}/feedbackItems`); }
  get(projectId, itemId) { return this.client.get(`projects/${projectId}/feedbackItems/${itemId}`); }
  create(projectId, payload) { return this.client.post(`projects/${projectId}/feedbackItems`, payload); }
  update(projectId, itemId, payload) { return this.client.put(`projects/${projectId}/feedbackItems/${itemId}`, payload); }
  delete(projectId, itemId) { return this.client.delete(`projects/${projectId}/feedbackItems/${itemId}`); }
}

class PackagesAPI {
  constructor(client) { this.client = client; }
  list(projectId) { return this.client.get(`projects/${projectId}/packages`); }
  get(projectId, packageId) { return this.client.get(`projects/${projectId}/packages/${packageId}`); }
}

class RevisionsAPI {
  constructor(client) { this.client = client; }
  list(projectId, branchId, fileId) { return this.client.get(`projects/${projectId}/branches/${branchId}/files/${fileId}/revisions`); }
  get(projectId, branchId, fileId, revisionId) { return this.client.get(`projects/${projectId}/branches/${branchId}/files/${fileId}/revisions/${revisionId}`); }
  restore(projectId, branchId, fileId, revisionId, payload = {}) {
    return this.client.put(`projects/${projectId}/branches/${branchId}/files/${fileId}/revisions/${revisionId}/restore`, payload);
  }
}

class ApprovalsAPI {
  constructor(client) { this.client = client; }
  list(projectId) { return this.client.get(`projects/${projectId}/approvals`); }
  get(projectId, approvalId) { return this.client.get(`projects/${projectId}/approvals/${approvalId}`); }
  update(projectId, approvalId, payload) { return this.client.put(`projects/${projectId}/approvals/${approvalId}`, payload); }
}

class BOMsAPI {
  constructor(client) { this.client = client; }
  list(projectId) { return this.client.get(`projects/${projectId}/boms`); }
  get(projectId, bomId) { return this.client.get(`projects/${projectId}/boms/${bomId}`); }
  create(projectId, payload) { return this.client.post(`projects/${projectId}/boms`, payload); }
}

class SearchAPI {
  constructor(client) { this.client = client; }
  query(payload) { return this.client.put('search', payload); }
}

module.exports = { BildClient, DEFAULT_BASE_URL };