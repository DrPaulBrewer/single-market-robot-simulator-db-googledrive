/* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false */

/* eslint-disable no-console */

import {StudyFolder, drive, driveX, arrayPrefer} from './StudyFolder.js';
export {StudyFolder};
import * as pAny from 'p-any';

const DB = {};
const folderMimeType = 'application/vnd.google-apps.folder';
const studyFolderRole = 'Econ1.Net Study Folder';
const iAm = {};
const hint = {};



// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');

// dbdo -- safely run an optional function if it exists in DB.init configuration

function dbdo(method, params){
  if (typeof(DB[method])==='function')
    try {
      DB[method](params);
    } catch(e){
      console.log("Error from externally supplied DB."+method);
      console.log(e);
    }
}

/**
 *  On load, called to load the auth2 library and API client library.
 */

export function handleGoogleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */

function initClient() {
    gapi.client.init({
        apiKey: DB.apiKey,
        clientId: DB.clientId,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        if (authorizeButton) authorizeButton.onclick = handleAuthClick;
        if (signoutButton) signoutButton.onclick = handleSignoutClick;
    });
}


/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */

async function updateSigninStatus(isSignedIn) {
    window.isSignedIn = isSignedIn;
    if (authorizeButton) authorizeButton.style.display = (isSignedIn)? 'none' : 'block';
    if (signoutButton) signoutButton.style.display = (isSignedIn)? 'block': 'none';
    if (isSignedIn){
        $('.hideOnSignin').hide();
        $('.showOnSignin').show();
        $('.clickOnSignin').click();
        showUserInfo();
        Object.assign(hint, await getHint());
        dbdo('onSignIn');
    } else {
        $('.hideOnSignout').hide();
        $('.showOnSignout').show();
        $('.clickOnSignout').click();
        removeUserInfo();
        dbdo('onSignOut');
    }
}

async function showUserInfo(){
  const user = await whoAmI();
  $('.userEmailAddress').text(user.emailAddress);
  $('.userDisplayName').text(user.displayName);
}

function removeUserInfo(){
  delete iAm.user;
  $('.userEmailAddress').text('');
  $('.userDisplayName').text('');
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
    setTimeout(function(){ window.location.reload(); }, 800);
}

export function init({apiKey, clientId, onSignIn, onSignOut, onHint, gatekeeper}){
    DB.apiKey = apiKey;
    DB.clientId = clientId;
    DB.onSignIn = onSignIn;
    DB.onSignOut = onSignOut;
    DB.onHint = onHint;
    DB.gatekeeper = gatekeeper;
}

async function whoAmI(force){
    if ((!iAm.user) || force){
        const response = await gapi.client.drive.about.get({fields:'user,storageQuota'});
        const result = response.result;
        iAm.user = result.user;
        iAm.storageQuota = result.storageQuota;
    }
    return iAm.user;
}

function pSignedIn(){
    return new Promise(function(resolve){
        function loop(){
            if (window.isSignedIn) return resolve(true);
            else setTimeout(loop, 250);
        }
        loop();
    });
}

async function pGatekeeper(){
  if (typeof(DB.gatekeeper)==='function'){
    const user = await whoAmI();
    try {
       const go = await DB.gatekeeper(driveX, user);
       return go;
     } catch(e){
       window.alert(e.toString());
       throw e;
     }
   }
  return false;
}

export async function myPrimaryFolder(){
    await pSignedIn();
    await pGatekeeper();
    const user = await whoAmI(false);
    const userName = user.emailAddress.split('@')[0];
    if (!userName.length) throw new Error("Error: myPrimaryFolder(), user.emailAddress is blank");
    const folderName = 'Econ1Net-'+userName;
    const folder = await (driveX.folderFactory()('root',folderName));
    return folder;
}

export async function listStudyFolders({ trashed }){
    await pSignedIn();
    await pGatekeeper();
    const fields = 'id,name,description,properties,modifiedTime';
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
    if (hint.existingFolderId){
      files = arrayPrefer(files,(f)=>(f.id===hint.existingFolderId),1);
      if (
        (files.length>0) &&
        (hint.file && hint.file.id) &&
        (files[0].id === hint.existingFolderId)
      ) files[0].hintFileId = hint.file.id;
    }
    const studyFolders = files.map((f)=>(new StudyFolder(f)));
    return studyFolders;
}

export async function createStudyFolder({name}){
    if (!window.isSignedIn)
        throw new Error("not signed into Google Drive");
    const creator = driveX.folderCreator({
        properties: {
            role: studyFolderRole
        }
    });
    const parent = await myPrimaryFolder();
    const folder = await creator(parent, name);
    if (!folder || !folder.id) throw new Error("creating Study Folder "+name+" failed");
    return new StudyFolder(folder);
}

function body(response){
  return response && response.body;
}

async function requireStudyFolder(fileId){
  const candidate = body(
    await drive.files.get({fileId, fields:'id,name,mimeType,modifiedTime,properties'})
  );
  if (
    candidate &&
    candidate.properties &&
    (candidate.mimeType === folderMimeType) &&
    (candidate.properties.role===studyFolderRole)
  ) return candidate;
  throw new Error("not a study folder");
}

export async function parentStudyFolder({id, name, parents}){
    let fileParents = parents;
    if ((name.endsWith(".zip")) || (name.endsWith(".json"))){
      if (!fileParents || !(fileParents.length)) {
        const file = body(await drive.files.get({fileId: id, fields:'id,name,parents'}));
        fileParents = file.parents;
      }
      if (!Array.isArray(fileParents))
        return false;
      if (fileParents.length === 0)
        return false;
      if (fileParents.length>10)
        throw new Error("too many parents for file: "+(fileParents.length)+' '+name);
      const parentFolder = await pAny(fileParents.map(requireStudyFolder));
      return new StudyFolder(parentFolder);
    }
    return false;
}

async function getHint(){
  const hint = driveX.appDataFolder.readBurnHint();
  if (typeof(hint)==='object'){
    const { file } = hint; // also contents
    const existingFolder = await parentStudyFolder(file);
    if (existingFolder && existingFolder.id){
      hint.existingFolderId = existingFolder.id;
    }
    dbdo('onHint',{hint, drive, driveX});
  }
  return hint;
}
