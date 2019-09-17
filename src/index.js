/* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false */

/* eslint-disable no-console */

import { StudyFolder, driveX, arrayPrefer } from './StudyFolder.js';
export { StudyFolder, driveX, getHint };

const folderMimeType = 'application/vnd.google-apps.folder';
const studyFolderRole = 'Econ1.Net Study Folder';
let hint = {};

function isSignedIn(){
  let ok = false;
  try {
    ok = window.GoogleUser.isSignedIn();
  } catch(e){
    console.log("smrs-db-googledrive:isSignedIn:"+e);
    ok = false;
  }
  return ok;
}

function pSignedIn() {
  return new Promise(function (resolve) {
    function loop() {
      if (isSignedIn()) return resolve(true);
      else setTimeout(loop, 250);
    }
    loop();
  });
}

export async function myPrimaryFolder() {
  await pSignedIn();
  const emailAddress = window.GoogleUser.getBasicProfile().getEmail();
  const userName = emailAddress.split('@')[0];
  if (!userName.length) throw new Error(`Error: myPrimaryFolder(), bad emailAddress = ${emailAddress}`);
  const folderName = 'Econ1Net-' + userName;
  const folder = await (driveX.folderFactory()('root', folderName));
  return folder;
}

export async function listStudyFolders({ trashed }) {
  await pSignedIn();
  const fields = 'id,name,description,properties,modifiedTime,webViewLink';
  const orderBy = 'modifiedTime desc';
  const searcher = driveX.searcher({
    orderBy,
    fields,
    trashed,
    mimeType: folderMimeType,
    properties: {
      role: studyFolderRole
    }
  });
  const response = await searcher();
  let files = response.files;
  if (hint.existingFolderId) {
    files = arrayPrefer(files, (f) => (f.id === hint.existingFolderId), 1);
    if (
      (files.length > 0) &&
      (hint.file && hint.file.id) &&
      (files[0].id === hint.existingFolderId)
    ) files[0].hintFileId = hint.file.id;
  }
  const studyFolders = files.map((f) => (new StudyFolder(f)));
  return studyFolders;
}

export async function createStudyFolder({ name }) {
  const parent = await myPrimaryFolder();
  const creator = driveX.folderCreator({
    properties: {
      role: studyFolderRole
    }
  });
  const folder = await creator(parent, name);
  if (!folder || !folder.id) throw new Error("creating Study Folder " + name + " failed");
  return new StudyFolder(folder);
}

function result(response) {
  return response && response.result;
}

function passOnlyStudyFolder(candidate) {
  console.log(candidate);
  console.log(!!(candidate.properties));
  console.log(candidate.mimeType, folderMimeType, candidate.mimeType === folderMimeType);
  console.log(candidate.properties.role, studyFolderRole, candidate.properties.role === studyFolderRole);
  if (
    candidate &&
    candidate.properties &&
    (candidate.mimeType === folderMimeType) &&
    (candidate.properties.role === studyFolderRole)
  ) return candidate;
  return false;
}

function pRequireStudyFolder(fileId) {
  const drive = gapi.client.drive;
  return (
    drive
    .files
    .get({ fileId, fields: 'id,name,mimeType,modifiedTime,properties,webViewLink' })
    .then(result)
    .then(passOnlyStudyFolder, (e)=>(console.log(e)))
  );
}

export async function parentStudyFolder({ name, parents }) {
  if (!Array.isArray(parents))
    throw new Error("parents is required to be an Array");
  if (parents.length === 0)
    return false;
  if (parents.length > 10)
    throw new Error("too many parents for file: " + (parents.length) + ' ' + name);
  try {
    const promises = parents.map(pRequireStudyFolder);
    const results = await(Promise.all(promises));
    const parentFolder = results.find((r)=>(typeof(r)==='object'));
    if (parentFolder)
      return new StudyFolder(parentFolder);
    else
      return false;
  } catch (e) { console.log(e); return false; }
}


async function getHint() {
  // hint is defined at top of module
  hint = await driveX.appDataFolder.readBurnHint();
  console.log("got hint: ", hint);
  if ((typeof (hint) === 'object') && (typeof (hint.file) === 'object')) {
    const { file } = hint; // also contents
    const existingFolder = await parentStudyFolder(file);
    console.log("existing folder", existingFolder);
    if (existingFolder && existingFolder.id) {
      hint.existingFolderId = existingFolder.id;
    }
  }
  return hint;
}
