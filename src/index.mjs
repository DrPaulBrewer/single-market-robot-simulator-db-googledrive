/* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false */

/* eslint-disable no-console */
/* eslint-disable no-use-before-define */

import { StudyFolderForGoogleDrive, driveX, arrayPrefer } from './extensionsForStudyFolder.mjs';
import { StudyFolderForZip } from 'single-market-robot-simulator-db-zip';
export { StudyFolderForGoogleDrive, driveX, getHint, defaultWebLink };

const defaultWebLink = 'https://drive.google.com';
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
      return setTimeout(loop, 250);
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
  const folder = await(driveX.folderFactory()('root', folderName));
  return folder;
}

export async function listStudyFolders(name) {
  await pSignedIn();
  const parent = await myPrimaryFolder();
  await getHint();
  const fields = 'id,name,description,properties,modifiedTime,webViewLink';
  const orderBy = 'modifiedTime desc';
  const trashed = false;
  // if name is undefined, it will be ignored by ssgd and match all names
  const searchTerms = {
    orderBy,
    fields,
    name,
    trashed,
    parents: parent.id,
    mimeType: folderMimeType,
    properties: {
      role: studyFolderRole
    }
  };
  const searcher = driveX.searcher(searchTerms);
  const response = await searcher();
  let files = response.files;
  if (hint && hint.existingFolderId) {
    files = arrayPrefer(files, (f) => (f.id === hint.existingFolderId), 1);
    if (
      (files.length > 0) &&
      (hint.file && hint.file.id) &&
      (files[0].id === hint.existingFolderId)
    ) files[0].hintFileId = hint.file.id;
  }
  const studyFolders = files.map((f) => (new StudyFolderForGoogleDrive(f)));
  if (!name && hint && hint.includeFolder){
      studyFolders.unshift(hint.includeFolder);
  }
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
  return new StudyFolderForGoogleDrive(folder);
}

function result(response) {
  return response && response.result;
}

function passOnlyStudyFolder(candidate) {
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
    .get({ fileId, fields: 'id,name,mimeType,modifiedTime,properties,parents,webViewLink' })
    .then(result)
    .then(passOnlyStudyFolder, (e)=>(console.log(e)))
  );
}

export async function parentStudyFolder({ name, parents }) {
  const primaryFolder = await myPrimaryFolder();
  if (!Array.isArray(parents))
    throw new Error("parents is required to be an Array");
  if (parents.length === 0)
    return false;
  if (parents.length > 10)
    throw new Error("too many parents for file: " + (parents.length) + ' ' + name);
  try {
    const promises = parents.map(pRequireStudyFolder);
    const results = await(Promise.all(promises));
    const parentFolder = results.find(
      (r)=>((typeof(r)==='object') && (r.parents.includes(primaryFolder.id)))
    );
    if (parentFolder)
      return new StudyFolderForGoogleDrive(parentFolder);
    return false;
  } catch (e) { console.log(e);return false;}
}

let hintStatus = 0;

async function getHint() {
  if (hintStatus===0) {
    hintStatus = 1;
    await getHintOnce();
    return hint;
  } else if (hintStatus===1) {
    return new Promise(function(resolve){
      function loop(){
        if (hintStatus===2){
          resolve(hint);
        } else {
          setTimeout(loop,500);
        }
      }
      setTimeout(loop,100);
    });
  }
  return hint;
}

async function getHintOnce(){
  const ahint = await driveX.appDataFolder.readBurnHint();
  console.log("got hint: ", ahint);
  if ((typeof(ahint) === 'object') && (typeof(ahint.file) === 'object')) {
    const { file } = ahint; // also contents
    // file is an object and should have properties name, parents, etc...
    const existingFolder = await parentStudyFolder(file);
    console.log("existing folder", existingFolder);
    if (existingFolder && existingFolder.id) {
      ahint.existingFolderId = existingFolder.id;
    } else if (file && (file.mimeType==='application/zip') && (file.id)) {
      ahint.includeFolder = new StudyFolderForZip({
        zipPromise: driveX.contents(file.id),
        zipName: file.name,
        zipSize: +file.size
      });
    } else if (file && file.mimeType && file.mimeType.includes("json") && ahint.contents){
      const config = ahint.contents;
      if (config && config.name && config.common && Array.isArray(config.configurations)){
        ahint.includeFolder = {
            name: 'extenal json file: '+file.name,
            async listFiles(){ return []; },
            async getConfig(){
              return config;
            }
        };
      } else {
        window.alert("Failed to load Drive file:"+config.name+" because it isn't a valid configuration."); // eslint-disable-line no-alert
      }
    }
  }
  hint = ahint;
  hintStatus=2;
}
