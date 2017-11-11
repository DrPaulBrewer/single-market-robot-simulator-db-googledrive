/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global gapi:false, pUploaderForGoogleDrive:false */

import ssgd from 'search-string-for-google-drive';
import extensionsForGoogleDrive from './xForGoogleDrive';

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

let user = null;
let storageQuota = null;

export function init({onSignIn,onSignOut,onProgress}){
}

async function updateMe(){
    const response = await gapi.client.drive.about.get({fields:'user,storageQuota'});
    const result = response.result;
    user = result.user;
    storageQuota = result.storageQuota;
    return result;
}


async function econ1NetMainFolder(){
    const whoAmI = (user.displayName || user.emailAddress).replace(/ /g, '-');
    const folderName = 'Econ1Net-'+whoAmI;
    const folder = await (X.folderFactory()('root',name));
    return folder;
}
        

export async function availableStudies(options){
    const trashed = !!(options.trashed);
    const fields = 'files(id,name,description,parents)';
    const q = ssgd({
        mimeType: folderMimeType,
        properties: {
            role: folderRole
        },
        trashed
    });
    const request = {
        q,
        orderBy,
        fields,
        spaces,
        pageSize
    };
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
    const trashed = false;
    const fields = 'id,properties';
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
    const config = (typeof(contents==='string'))? JSON.parse(contents): contents;
    return Object.assign(
        {},
        study,
        config
    );
}

export async function saveStudyConfig(study){
    async function createStudyDirectory(options){
        const parents = await econ1NetMainFolder();
        const metaData = Object.assign(
            {},
            {
                mimeType: folderMimeType,
                role: studyFolderRole
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
        onProgress: dbProgressReporter('uploading')
    });
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
        onProgress: dbProgressReporter('uploading')
    });
}

