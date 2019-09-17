/* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false */

import ssgd from 'search-string-for-google-drive';
import pReduce from 'p-reduce';

export function extensionsForGoogleDrive({ rootFolderId, spaces }) {
  // inspired by v2.0.0 npm:decorated-google-drive, modified to use gapi.client.drive
  // and modified for browser environment

  const folderMimeType = 'application/vnd.google-apps.folder';

  const x = {};

  function driveSearcher(options) {
    var limit = (options.limit || 1000);
    const unique = options.unique;
    if (unique) limit = 2;
    const allowMatchAllFiles = options && options.allowMatchAllFiles;
    const fields = options.fields || 'id,name,mimeType,modifiedTime,size,webViewLink';
    const orderBy = options.orderBy || 'folder,name,modifiedTime desc';
    const searchTerms = ssgd.extract(options);
    if (!searchTerms.trashed) searchTerms.trashed = false; // trashed:false must be default for findPath, etc.
    if (searchTerms.sharedWithMe === false) throw new Error("extensionsForGoogleDrive: driveSearcher -- sharedWithMe:false known to be problematic in upstream Drive API");

    return async function (parent, name) {
      const search = Object.assign({}, searchTerms, { parent, name });
      const searchString = ssgd(search, allowMatchAllFiles);
      const params = {
        spaces,
        q: searchString,
        pageSize: limit,
        maxResults: limit,
        orderBy,
        fields: `files(${fields})`
      };
      const response = await gapi.client.drive.files.list(params);
      return {
        parent,
        name,
        searchTerms,
        limit,
        unique,
        isSearchResult: true,
        files: response.result.files
      };
    };
  }

  x.searcher = driveSearcher;

  const BadRequest = "checkSearch: bad request";
  const FileNotFound = "checkSearch: file not found";
  const ExpectedUniqueFile = "checkSearch: expected unique file";
  const TooManyFiles = "checkSearch: increase limit or too many files found";

  function checkSearch(searchResult) {
    if (!Array.isArray(searchResult.files))
      throw new Error(BadRequest);
    if (searchResult.files.length === 0)
      throw new Error(FileNotFound);
    if (searchResult.unique && (searchResult.files.length > 1))
      throw new Error(ExpectedUniqueFile);
    if (searchResult.files.length === searchResult.files.limit)
      throw new Error(TooManyFiles);
    searchResult.ok = true;
    return searchResult;
  }

  x.checkSearch = checkSearch;

  function driveJanitor(fileListProperty, successProperty) {
    function deleteFile(file) {
      return gapi.client.drive.files.delete({ fileId: file.id });
    }
    return async function (info) {
      if (successProperty) info[successProperty] = false;
      let files = (fileListProperty) ? info[fileListProperty] : info;
      if (files && files.id) files = [files];
      if ((Array.isArray(files)) && (files.length > 0)) {
        return (
          Promise
          .all(files.map(deleteFile))
          .then(
            () => {
              info[successProperty] = true;
              return info;
            },
            () => {
              return info;
            }
          )
        );
      }
      return Promise.resolve(info);
    };
  }

  x.janitor = driveJanitor;

  function getFolderId(folderIdOrObject) {
    if (typeof (folderIdOrObject) === 'object') {
      if (folderIdOrObject.id) {
        if (folderIdOrObject.mimeType === folderMimeType)
          return folderIdOrObject.id;
      }
    }
    if (typeof (folderIdOrObject) === 'string') {
      return folderIdOrObject;
    }
    throw new Error("bad request, not a folder or folder id");
  }

  function driveStepRight(options) {
    const searcherOptions = {
      unique: true
    };
    if (options.fields) searcherOptions.fields = options.fields;
    const search = driveSearcher(searcherOptions);
    return async function (folderIdOrObject, name) {
      const parentId = getFolderId(folderIdOrObject);
      const searchResult = checkSearch(await search(parentId, name));
      return searchResult.files[0];
    };
  }

  x.stepRight = driveStepRight;

  // see https://developers.google.com/drive/v3/web/folder

  function driveFolderCreator(meta) {
    return async function (f, name) {
      const parentFolderId = getFolderId(f);
      const metaData = Object.assign({}, meta, {
        mimeType: folderMimeType,
        name,
        parents: [parentFolderId]
      });
      const fieldList = Object.keys(metaData);
      fieldList.unshift('modifiedTime');
      fieldList.unshift('id');
      // see https://stackoverflow.com/questions/34905363/create-file-with-google-drive-api-v3-javascript
      const createdFolder = await gapi.client.drive.files.create({
        fields: fieldList.join(','),
        resource: metaData
      });
      return createdFolder.result;
    };
  }

  x.folderCreator = driveFolderCreator;

  function driveFolderFactory(meta) {
    const stepper = driveStepRight({ fields: (meta && meta.fields) });
    const creator = driveFolderCreator(meta);
    return async function (f, name) {
      let folder;
      try {
        folder = await stepper(f, name);
      } catch (e) {
        if (e.toString().includes(FileNotFound)) folder = await creator(f, name);
        else throw e;
      }
      return folder;
    };
  }

  x.folderFactory = driveFolderFactory;

  async function driveFindPath(path, fields) {
    const parts = path.split('/').filter((s) => (s.length > 0));
    const stepper = driveStepRight({ fields });
    const metadata = await pReduce(parts, stepper, rootFolderId);
    return metadata;
  }

  x.findPath = driveFindPath;

  async function driveContents(fileId, mimeType) {
    let response;
    try {
      response = await gapi.client.drive.files.get({ fileId, spaces, alt: 'media' });
    } catch (e) {
      if (!mimeType) throw e;
      if (e.toString().includes("Use Export")) {
        response = await gapi.client.drive.files.export({ fileId, spaces, mimeType });
      }
    }
    return response && response.body;
  }

  x.contents = driveContents;

  async function driveDownload(path, mimeType) {
    const file = await driveFindPath(path);
    const contents = await driveContents(file.id, mimeType);
    return contents;
  }

  x.download = driveDownload;

  async function driveCreatePath(path, meta) {
    const parts = path.split('/').filter((s) => (s.length > 0));
    const last = parts.pop();
    const dff = driveFolderFactory();
    const parentFolder = await pReduce(parts, dff, rootFolderId);
    const lastFolder = await (driveFolderFactory(meta)(parentFolder, last));
    return lastFolder;
  }

  x.createPath = driveCreatePath;

  async function driveUpdateMetadata(fileId, metadata) {
    const fields = 'id,name,trashed,description,mimeType,modifiedTime,size,parents,properties,appProperties,webViewLink';
    const response = await gapi.client.drive.files.update({ fileId, fields, resource: metadata });
    return response;
  }

  x.updateMetadata = driveUpdateMetadata;

  async function driveReadBurnHint() {
    const path = 'hint';
    let hint = false;
    try {
      const file = await driveFindPath(path);
      const contents = await driveContents(file.id);
      hint = (typeof(contents) === 'string') ? JSON.parse(contents) : contents;
      if (file && file.id) {
        await gapi.client.drive.files.delete({ fileId: file.id });
      }
    } catch (e) { hint = false; }
    return hint;
  }

  if (spaces === 'appDataFolder') x.readBurnHint = driveReadBurnHint;

  return x;

}

export const driveX = extensionsForGoogleDrive({
  rootFolderId: 'root',
  spaces: 'drive'
});

driveX.appDataFolder = extensionsForGoogleDrive({
  rootFolderId: 'appDataFolder',
  spaces: 'appDataFolder'
});
