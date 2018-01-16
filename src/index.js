/* Copyright 2017- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, pUploaderForGoogleDrive:false, Promise:false */

/* eslint-disable no-console */

import {extensionsForGoogleDrive} from './extensionsForGoogleDrive.js';
import ssgd from 'search-string-for-google-drive';
import * as Study from 'single-market-robot-simulator-study';
import clone from 'clone';

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
}

const X = extensionsForGoogleDrive({
    rootFolderId: 'root',
    spaces: 'drive'
});

const spaces = 'drive';
const pageSize = 1000;
const orderNewestFirst = 'modifiedTime desc';

const folderMimeType = 'application/vnd.google-apps.folder';
const studyFolderRole = 'Econ1.Net Study Folder';

const configMimeType = 'application/json';
const configName = 'config.json';
const iAm = {};

const DB = {};

export function init({onSignIn,onSignOut,onProgress}){
    DB.onSignIn = onSignIn;
    DB.onSignOut = onSignOut;
    DB.onProgress = onProgress;
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


async function econ1NetMainFolder(){
    const user = await whoAmI(false);
    const userName = (user.displayName || user.emailAddress).replace(/ /g, '-');
    const folderName = 'Econ1Net-'+userName;
    const folder = await (X.folderFactory()('root',folderName));
    return folder;
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

export async function availableStudies(){
    console.log("TODO: fix smrs-db-googledrive availableStudies, should take options, be supplied with options upstream");
    const fields = 'files(id,name,description,properties,parents)';
    const q = ssgd({
	trashed: false,
        mimeType: folderMimeType,
        properties: {
            role: studyFolderRole
        }
    });
    const request = {
        q,
        orderBy: orderNewestFirst,
        fields,
        spaces,
        pageSize
    };
    const ok = await pSignedIn(); // eslint-disable-line no-unused-vars
    const response = await gapi.client.drive.files.list(request);
    return response.result.files;
}

export async function sendToTrash(study){
    const response = await gapi.client.drive.files.update({fileId: study.id},{trashed:true});
    return response;
}

export async function recoverFromTrash(study){
    const response =  await gapi.client.drive.files.update({fileId: study.id},{trashed:false});
    return response; 
}

export async function getStudyConfig(studyFolder){
    if (!studyFolder || (!studyFolder.id))
        throw new Error("missing studyFolder.id");
    const folderId = studyFolder.id;
    const fields = 'files(id,properties)';
    const q = ssgd({
	trashed: false,
        parents: folderId,
        name: configName,
        mimeType: configMimeType,
    });
    const request = { q, fields, spaces, pageSize, orderBy:orderNewestFirst };
    const response = await gapi.client.drive.files.list(request);
    const file = response.result.files[0];
    const contents = await X.contents(file.id);
    const config = (typeof(contents)==='string')? JSON.parse(contents): contents;
    console.log(config);
    return {
	folder: clone(studyFolder),
	config
    };
}

function onUploadProgress(e){
    console.log(e);
}

export async function saveStudyConfig(study){
    console.log("saveStudyConfig");
    console.log(study);
    async function createStudyDirectory(options){
        const parent = await econ1NetMainFolder();
        const metaData = Object.assign(
            {},
            {
                mimeType: folderMimeType,
                properties: {
                    role: studyFolderRole
                },
                parents: [parent]
            },
            options
        );
        const response = await gapi.client.drive.files.create({
            fields: 'id,name,description'
        }, metaData);
        return response.result;
    }
    const config = study.config;
    const options = {
        id: study.folderId,
        name: study.name,
        description: study.description
    };  
    let folderId, createdDir;
    if (options.id){
        folderId = options.id;
    } else {
        createdDir = await createStudyDirectory(options);
        folderId = createdDir.id;
    }
    const upload = await pUploaderForGoogleDrive({
        file: new Blob([JSON.stringify(config,null,2)], { type: 'application/json'}),
        metadata: {
            name: configName,
            mimeType: 'application/json',
            parents: [folderId]
        },
        params: {
            spaces,
            fields: 'id,name,mimeType'
        },
        onProgress: onUploadProgress
    });
    upload.z = undefined;
    return study;
}

export async function uploadStudyZip(zipBlob, options){
    const uploader = await pUploaderForGoogleDrive({
        file: zipBlob,
        metadata: {
            name: Study.myDateStamp(),
            mimeType: 'application/zip',
            description: options.description || '',
            parents: [options.id]
        },
        params: {
            spaces,
            fields: 'id,name,mimeType'
        },
        onProgress: onUploadProgress
    });
    return uploader;
}

