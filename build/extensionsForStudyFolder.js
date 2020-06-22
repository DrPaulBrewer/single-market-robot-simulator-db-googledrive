"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "driveX", {
  enumerable: true,
  get: function get() {
    return _extensionsForGoogleDrive.driveX;
  }
});
Object.defineProperty(exports, "arrayPrefer", {
  enumerable: true,
  get: function get() {
    return _arrayPrefer.default;
  }
});
exports.StudyFolderForGoogleDrive = void 0;

var _extensionsForGoogleDrive = require("./extensionsForGoogleDrive");

var _arrayPrefer = _interopRequireDefault(require("array-prefer"));

var _singleMarketRobotSimulatorDbStudyfolder = require("single-market-robot-simulator-db-studyfolder");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */

/* This file is open source software.  The MIT License applies to this software. */

/* global pUploaderForGoogleDrive:false */

/* eslint-disable no-console */
class StudyFolderForGoogleDrive extends _singleMarketRobotSimulatorDbStudyfolder.StudyFolder {
  async search(name) {
    const trashed = false;
    const folderId = this.id;
    const orderBy = 'modifiedTime desc';

    const searcher = _extensionsForGoogleDrive.driveX.searcher({
      trashed,
      orderBy
    });

    const response = await searcher(folderId, name);
    return response.files;
  }

  async download({
    name,
    id
  }) {
    const fileId = id || (await this.fileId(name));
    const contents = await _extensionsForGoogleDrive.driveX.contents(fileId);
    if (name.endsWith('.json') && typeof contents === 'string') return JSON.parse(contents);
    return contents;
  }

  async update(metadata) {
    const folder = this;
    const response = await _extensionsForGoogleDrive.driveX.updateMetadata(folder.id, metadata);
    return response;
  }

  async upload({
    name,
    contents,
    blob,
    onProgress,
    force
  }) {
    const files = await this.listFiles();
    const hasZipFiles = files.some(f => f.name.endsWith(".zip"));
    if (!force && name === 'config.json' && hasZipFiles) throw new Error("conflict Error in upload logic: may not clobber config.json in a study folder with existing .zip file data: config.json unchanged");
    const existingFile = files.filter(f => f.name === name);
    const existingFileId = Array.isArray(existingFile) && existingFile[0] && existingFile[0].id;
    const folderId = this.id;
    let myFile = null;
    let mimeType = '';

    if (contents) {
      myFile = new Blob([JSON.stringify(contents, null, 2)], {
        type: 'application/json'
      });
      mimeType = 'application/json';
    }

    if (blob) {
      myFile = blob;
      if (name.endsWith(".zip")) mimeType = 'application/zip';else mimeType = blob.type || 'application/octet-stream';
    }

    const metadata = !existingFileId && {
      name,
      mimeType,
      parents: [folderId]
    };
    const uploadedDriveFile = await pUploaderForGoogleDrive({
      file: myFile,
      fileId: existingFileId,
      metadata,
      params: {
        spaces: 'drive',
        fields: 'id,name,mimeType,modifiedTime,size,parents,webViewLink'
      },
      onProgress
    });
    return uploadedDriveFile;
  }

}

exports.StudyFolderForGoogleDrive = StudyFolderForGoogleDrive;