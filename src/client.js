const axios = require('axios');
const { BildApiError, BildAuthError } = require('./errors');

const DEFAULT_BASE_URL = 'https://api.portle.io/api';

class BildClient {
  constructor({ token = process.env.BILD_API_KEY, baseUrl = DEFAULT_BASE_URL, timeout = 30000 } = {}) {
    if (!token) {
      throw new Error('Missing token. Pass { token } or set BILD_API_KEY');
    }

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
      files: new FilesAPI(this),
      metadata: new MetadataAPI(this),
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

  get(path, params) {
    return this.request('GET', path, { params });
  }

  post(path, data, params) {
    return this.request('POST', path, { params, data });
  }

  put(path, data, params) {
    return this.request('PUT', path, { params, data });
  }

  delete(path, params) {
    return this.request('DELETE', path, { params });
  }
}

class UsersAPI {
  constructor(client) {
    this.client = client;
  }

  list() {
    return this.client.get('users');
  }

  add({ emails, role = 'Member', projects = [] }) {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new Error('emails must be a non-empty array');
    }
    return this.client.put('users/add', { emails, role, projects });
  }
}

class ProjectsAPI {
  constructor(client) {
    this.client = client;
  }

  list() {
    return this.client.get('projects');
  }

  users(projectId) {
    return this.client.get(`projects/${projectId}/users`);
  }

  files(projectId) {
    return this.client.get(`projects/${projectId}/files`);
  }
}

class FilesAPI {
  constructor(client) {
    this.client = client;
  }

  latestVersion(projectId, branchId, fileId) {
    return this.client.get(`projects/${projectId}/branches/${branchId}/files/${fileId}/latestFileVersion`);
  }

  universalFormat(projectId, branchId, fileId, { fileVersion, outputFormat }) {
    return this.client.post(
      `projects/${projectId}/branches/${branchId}/files/${fileId}/universalFormat`,
      { fileVersion, universalFileFormat: outputFormat }
    );
  }

  toSTL(projectId, branchId, fileId, fileVersion) {
    return this.universalFormat(projectId, branchId, fileId, { fileVersion, outputFormat: 'stl' });
  }

  toSTEP(projectId, branchId, fileId, fileVersion) {
    return this.universalFormat(projectId, branchId, fileId, { fileVersion, outputFormat: 'step' });
  }
}

class MetadataAPI {
  constructor(client) {
    this.client = client;
  }

  fields() {
    return this.client.get('metadataFields');
  }

  fileMetadata(projectId, branchId, fileId) {
    return this.client.get(`projects/${projectId}/branches/${branchId}/files/${fileId}/metadata`);
  }
}

class SearchAPI {
  constructor(client) {
    this.client = client;
  }

  query(payload) {
    return this.client.put('search', payload);
  }
}

module.exports = { BildClient, DEFAULT_BASE_URL };
