/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, pUploaderForGoogleDrive:false, Promise:false */

/* eslint-disable no-console */

import ssgd from 'search-string-for-google-drive';
import pReduce from 'p-reduce';
import * as Study from 'single-market-robot-simulator-study';

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

function extensionsForGoogleDrive({rootFolderId, spaces}){
    // inspired by v2.0.0 npm:decorated-google-drive, modified to use gapi.client.drive
    // and modified for browser environment

    const folderMimeType = 'application/vnd.google-apps.folder';
    
    const x = {};

    function driveSearcher(options){
        var limit = ( options.limit || 1000 );
        const unique = options.unique;
        if (unique) limit = 2;
        const allowMatchAllFiles = options && options.allowMatchAllFiles;
        const fields = options.fields || 'id,name,mimeType,modifiedTime,size'; 
        const searchTerms = ssgd.extract(options);
        if (!searchTerms.trashed) searchTerms.trashed = false; // trashed:false must be default for findPath, etc.
        if (searchTerms.sharedWithMe===false) throw new Error("extensionsForGoogleDrive: driveSearcher -- sharedWithMe:false known to be problematic in upstream Drive API");
        console.log(searchTerms);
        
        return async function(parent, name){
            const search = Object.assign({}, searchTerms, { parent, name });
            console.log(search);
            const searchString = ssgd(search, allowMatchAllFiles);
            console.log(searchString);
            const params = {
                spaces,
                q: searchString,
                pageSize: limit,
                maxResults: limit,
                orderBy: "folder,name,modifiedTime desc",
                fields: `files(${fields})`
            };
            const response = await gapi.client.drive.files.list(params);
            return {
                parent,
                name,
                searchTerms,
                limit,
                unique,
                isSearchResult:true,
                files: response.result.files
            };
        };                         
    }

    x.searcher = driveSearcher;

    const BadRequest = "checkSearch: bad request";
    const FileNotFound = "checkSearch: file not found";
    const ExpectedUniqueFile = "checkSearch: expected unique file";
    const TooManyFiles = "checkSearch: increase limit or too many files found";
    
    function checkSearch(searchResult){
        if (!Array.isArray(searchResult.files))
            throw new Error(BadRequest);
        if (searchResult.files.length===0)
            throw new Error(FileNotFound);
        if (searchResult.unique && (searchResult.files.length>1))
            throw new Error(ExpectedUniqueFile);
        if (searchResult.files.length===searchResult.files.limit)
            throw new Error(TooManyFiles);
        searchResult.ok = true;
        return searchResult;
    }

    x.checkSearch = checkSearch;

    function driveJanitor(fileListProperty, successProperty){
        function deleteFile(file){
            return gapi.client.drive.files.delete({fileId: file.id});
        }
        return async function(info){
            if (successProperty) info[successProperty] = false;
            let files = (fileListProperty)? info[fileListProperty] : info;
            if (files && files.id) files = [files];
            if ((Array.isArray(files)) && (files.length>0)){
                return (
                    Promise
                        .all(files.map(deleteFile))
                        .then(
                            ()=>{
                                info[successProperty] = true;
                                return info;
                            },
                            ()=>{
                                return info;
                            }
                        )
                );
            }
            return Promise.resolve(info);
        };
    }

    x.janitor = driveJanitor;
    
    function getFolderId(folderIdOrObject){
        if (typeof(folderIdOrObject)==='object'){
            if (folderIdOrObject.id){
                if (folderIdOrObject.mimeType===folderMimeType)
                    return folderIdOrObject.id;
            }
        }
        if (typeof(folderIdOrObject)==='string'){
            return folderIdOrObject;
        }
        throw new Error("bad request, not a folder or folder id");
    }
    
    function driveStepRight(options){
        const searcherOptions = {
            unique: true,
            mimeType: folderMimeType
        };
        if (options.fields) searcherOptions.fields = options.fields;
        const search = driveSearcher(searcherOptions);
        return async function(folderIdOrObject, name){
            const parentId = getFolderId(folderIdOrObject);
            const searchResult = checkSearch(await search(parentId,name));
            return searchResult.files[0];
        };
    }

    x.stepRight = driveStepRight;
    
    // see https://developers.google.com/drive/v3/web/folder

    function driveFolderCreator(meta){
        return async function(f, name){
            const parentFolderId = getFolderId(f);      
            const metaData = Object.assign({}, meta,{
                mimeType: folderMimeType,
                name,
                parents: [parentFolderId]
            });
            return await gapi.client.drive.files.create({
                fields: 'id, mimeType, name'
            }, metaData);
        };
    }

    x.folderCreator = driveFolderCreator;

    function driveFolderFactory(meta){
        const stepper = driveStepRight({fields: (meta && meta.fields)});
        const creator = driveFolderCreator(meta);
        return async function(f, name){
            let folder;
            try {
                folder = await stepper(f,name);
            } catch(e){
                if (e.toString().includes(FileNotFound)) folder = await creator(f,name);
                else throw e;
            }
            return folder;
        };
    }

    x.folderFactory = driveFolderFactory;
    
    async function driveFindPath(path, fields){
        const parts = path.split('/').filter((s)=>(s.length>0));
        const stepper = driveStepRight({fields});
        const metadata =  await pReduce(parts, stepper, rootFolderId);
        return metadata;
    }

    x.findPath = driveFindPath;

    async function driveContents(fileId, mimeType){
        let response;
        try {
            response = await gapi.client.drive.files.get({ fileId, spaces, alt: 'media' });
        } catch(e){
            if (!mimeType) throw e;
            if (e.toString().includes("Use Export")){
                response = await gapi.client.drive.files.export({ fileId, spaces, mimeType });
            }
        }
        return response && response.body;
    }

    x.contents = driveContents;

    async function driveDownload(path, mimeType){
        const file = await driveFindPath(path);
        const contents = await driveContents(file.id, mimeType);
        return contents;
    }

    x.download = driveDownload;

    async function driveCreatePath(path, meta){
        const parts = path.split('/').filter((s)=>(s.length>0));
        const last = parts.pop();
        const dff = driveFolderFactory();
        const parentFolder = await pReduce(parts, dff, rootFolderId);
        const lastFolder = await (driveFolderFactory(meta)(parentFolder, last));
        return lastFolder;
    }

    x.createPath = driveCreatePath;

    return x;

}

const X = extensionsForGoogleDrive({
    rootFolderId: 'root',
    spaces: 'drive'
});

const spaces = 'drive';
const pageSize = 1000;
const orderBy = 'modifiedTime desc';

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
        mimeType: folderMimeType,
        properties: {
            role: studyFolderRole
        }
    });
    const request = {
        q,
        orderBy,
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

export async function getStudyConfig(study){
    if (!study || (!study.id))
        throw new Error("missing study.id");
    const folderId = study.id;
    const fields = 'files(id,properties)';
    const q = ssgd({
        parents: folderId,
        name: configName,
        trashed: false,
        mimeType: configMimeType,
    });
    const request = { q, fields, spaces, pageSize, orderBy };
    const response = await gapi.client.drive.files.list(request);
    const file = response.result.files[0];
    const contents = await X.contents(file.id);
    const config = (typeof(contents)==='string')? JSON.parse(contents): contents;
    console.log(config);
    return Object.assign(
        {},
        study,
        config
    );
}

function onUploadProgress(e){
    console.log(e);
}

export async function saveStudyConfig(study){
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

