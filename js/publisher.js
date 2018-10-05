const API_ROOT = 'https://firebasehosting.googleapis.com/v1beta1/'

import {gzip,inflate} from 'pako';
import ab2str from 'arraybuffer-to-string';
import {sha256} from 'js-sha256';
import {update} from './state';

window.sha256 = sha256;

export default class Publisher {
  constructor(accessToken, siteName, config) {
    this.accessToken = accessToken;
    this.siteName = siteName;
    this.config = config;
    this.files = {};
    this.content = {};
  }

  async put(path, content) {
    const data = gzip(content, {level: 9});
    const stringData = gzip(content, {level: 9, to: 'string'});
    console.log('SHA', sha256(data));
    console.log('B64', btoa(stringData));
    console.log('INFLATE', inflate(data, {to: 'string'}));
    update({content: `data:text/plain+gzip;base64,${btoa(stringData)}`});
    const hash = sha256(data);
    this.files[path] = hash;
    this.content[hash] = data;
  }

  async publish() {
    const version = await this.api('POST', `sites/${this.siteName}/versions`, {config: this.config});
    const toUpload = await this.api('populateFiles', version.name, {files: this.files});
    console.log(toUpload);
    const uploadUrl = toUpload.uploadUrl;
    for (const hash of (toUpload.uploadRequiredHashes || [])) {
      const contentToUpload = this.content[hash];
      await this.upload(`${uploadUrl}/${hash}`, contentToUpload);
      console.log('Uploaded hash', hash);
    }

    const finalizeResponse = await this.api('PATCH', version.name + '?update_mask=status', {
      status: 'FINALIZED',
    });
    console.log(finalizeResponse);

    const releaseResponse = await this.api('POST', `sites/${this.siteName}/releases?version_name=${version.name}`, {
      message: "Published by TinyFile.",
    });
    console.log(releaseResponse);
  }

  async upload(url, content) {
    console.log('uploading:', url, inflate(content, {to: 'string'}));
    url = 'https://cors-anywhere.herokuapp.com/' + url;

    const response = await fetch(url, {
      method: 'POST',
      body: content,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream'
      },
    });

    console.log(response);
  }

  async api(method, name, body = null, options = {}) {
    let httpMethod = method;
    let apiMethod = '';

    if (!['GET', 'POST', 'PATCH'].includes(method)) {
      httpMethod = 'POST';
      apiMethod = `:${method}`;
    }

    const url = name.indexOf('://') >= 0 ? name : API_ROOT + name + apiMethod;

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    if (typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    const response = await fetch(url, {
      method: httpMethod,
      headers,
      body,
    });

    if (response.status >= 400) {
      let details;
      try {
        details = await response.json();
      } catch (e) {
        details = {error: {status: 'INTERNAL', code: response.status, message: 'Unknown HTTP error, invalid JSON response.'}}
      }

      const err = new Error(`${details.error.status}: ${details.error.message}`);
      err.details = details;
      throw err;
    }

    return await response.json();
  }
}
