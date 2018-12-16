/* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, Promise:false, driveX:false */

/* eslint-disable no-console */

import {driveX} from './extensionsForGoogleDrive.js';
import {StudyFolder} from './StudyFolder.js';
export {StudyFolder};

const CLIENT_ID = window.GCID;
const API_KEY = window.GK;

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com\
/auth/drive.appdata';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');

/**
 *  On load, called to load the auth2 library and API client library.
 */

window.handleGoogleClientLoad = function() {
    'use strict';
    gapi.load('client:auth2', initClient);
    $('#welcomeModal').modal('show');
};

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */

function initClient() {
    'use strict';
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
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

function updateSigninStatus(isSignedIn) {
    'use strict';
    console.log("got call of updateSigninStatus: "+isSignedIn);
    window.isSignedIn = isSignedIn;
    if (authorizeButton) authorizeButton.style.display = (isSignedIn)? 'none' : 'block';
    if (signoutButton) signoutButton.style.display = (isSignedIn)? 'block': 'none';
    if (isSignedIn){
        $('.hideOnSignin').hide();
        $('.showOnSignin').show();
        $('.clickOnSignin').click();
        showUserInfo();
    } else {
        $('.hideOnSignout').hide();
        $('.showOnSignout').show();
        $('.clickOnSignout').click();
        removeUserInfo();
    }
}

async function showUserInfo(){
  const user = await whoAmI();
  $('.userEmailAddress').text(user.emailAddress);
  $('.userDisplayName').text(user.displayName);
}

function removeUserInfo(){
  $('.userEmailAddress').text('');
  $('.userDisplayName').text('');
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    'use strict';
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
    'use strict';
    gapi.auth2.getAuthInstance().signOut();
    setTimeout(function(){ window.location.reload(); }, 800);
}


const folderMimeType = 'application/vnd.google-apps.folder';
const studyFolderRole = 'Econ1.Net Study Folder';

const iAm = {};

const DB = {};

export function init({onSignIn,onSignOut,onProgress,gatekeeper}){
    DB.onSignIn = onSignIn;
    DB.onSignOut = onSignOut;
    DB.onProgress = onProgress;
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
    const user = await whoAmI(false);
    try {
       const go = await DB.gatekeeper(window.driveX, user);
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
    return response.files.map((f)=>(new StudyFolder(f)));
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
