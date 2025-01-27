const axios = require('axios');
require('dotenv').config();

class Bild {
  /**
   * ## Bild API client
   * 
   * Either set 'BILD_API_KEY' in environment variables or pass a token to the constructor: 
   * token = <your_token>
   */
  constructor(token = 'env') {
    // Error messages
    this.authError = 'Authentication failed. Ensure you have a valid API key, that you have the correct permissions, and that you have passed it to the constructor.';
    this.pathError = 'Path not found. Bild has probably changed this endpoint.';
    this.tokenError = 'No token found/provided. Please set BILD_API_KEY in environment variables or using the constructor argument, token = <your_token>';

    // Check for JWT token
    this.token = token === 'env' ? process.env.BILD_API_KEY : token;

    if (!this.token) {
      throw new Error(this.tokenError);
    }

    this.headers = { Authorization: `Bearer ${this.token}` };
    this.baseurl = 'https://api.getbild.com';
    this.contentType = 'application/json;charset=UTF-8';
    this.branch = '';
    this.project = '';
    this.fileVersion = '';
    this.file = '';
  }

  setBranch(branchId) {
    this.branch = branchId;
  }

  setProject(projectId) {
    this.project = projectId;
  }

  setFileVersion(fileVersionId) {
    this.fileVersion = fileVersionId;
  }

  setFile(fileId) {
    this.file = fileId;
  }

  async checkResponse(response) {
    if (typeof response === 'string') {
      throw new Error(response);
    } else {
      return response.data;
    }
  }

  async getAllUsers() {
    const suffix = '/users';
    const response = await axios.get(`${this.baseurl}${suffix}`, { headers: this.headers });
    return this.checkResponse(response);
  }

  async addUsersToBild(emails = [], role = 'Member', projects = []) {
    if (!emails.length) {
      throw new Error('No emails provided');
    }

    const suffix = '/users/add';
    const data = { emails, role, projects };

    const response = await axios.put(`${this.baseurl}${suffix}`, data, { headers: this.headers });
    return this.checkResponse(response);
  }

  async getAllProjects() {
    const suffix = '/projects';
    const response = await axios.get(`${this.baseurl}${suffix}`, { headers: this.headers });
    return this.checkResponse(response);
  }

  async getAllFiles(projectId = null) {
    projectId = projectId || this.project;
    const suffix = `/projects/${projectId}/files`;
    const response = await axios.get(`${this.baseurl}${suffix}`, { headers: this.headers });
    return this.checkResponse(response);
  }

  async getAllUsersInProject(projectId = null) {
    projectId = projectId || this.project;
    const suffix = `/projects/${projectId}/users`;
    const response = await axios.get(`${this.baseurl}${suffix}`, { headers: this.headers });
    return this.checkResponse(response);
  }

  async generateSTL(projectId = null, branchId = null, fileId = null, fileVersion = null) {
    projectId = projectId || this.project;
    branchId = branchId || this.branch;
    fileId = fileId || this.file;
    fileVersion = fileVersion || this.fileVersion;

    const suffix = `/projects/${projectId}/branches/${branchId}/files/${fileId}/universalFormat`;
    const data = { fileVersion, universalFileFormat: 'stl' };

    const response = await axios.post(`${this.baseurl}${suffix}`, data, { headers: this.headers });
    return this.checkResponse(response);
  }

  async generateSTEP(projectId = null, branchId = null, fileId = null, fileVersion = null) {
    projectId = projectId || this.project;
    branchId = branchId || this.branch;
    fileId = fileId || this.file;
    fileVersion = fileVersion || this.fileVersion;

    const suffix = `/projects/${projectId}/branches/${branchId}/files/${fileId}/universalFormat`;
    const data = { fileVersion, universalFileFormat: 'step' };

    const response = await axios.post(`${this.baseurl}${suffix}`, data, { headers: this.headers });
    return this.checkResponse(response);
  }

  async getAllMetadataFields() {
    const suffix = '/metadataFields';
    const response = await axios.get(`${this.baseurl}${suffix}`, { headers: this.headers });
    return this.checkResponse(response);
  }

  async getMetadataFromFile(projectId = null, branchId = null, fileId = null) {
    projectId = projectId || this.project;
    branchId = branchId || this.branch;
    fileId = fileId || this.file;

    const suffix = `/projects/${projectId}/branches/${branchId}/files/${fileId}/metadata`;
    const response = await axios.get(`${this.baseurl}${suffix}`, { headers: this.headers });
    return this.checkResponse(response);
  }

  async getLatestFileVersion(projectId = null, branchId = null, fileId = null) {
    projectId = projectId || this.project;
    branchId = branchId || this.branch;
    fileId = fileId || this.file;

    const suffix = `/projects/${projectId}/branches/${branchId}/files/${fileId}/latestFileVersion`;
    const response = await axios.get(`${this.baseurl}${suffix}`, { headers: this.headers });
    return this.checkResponse(response);
  }
}

module.exports = Bild;
