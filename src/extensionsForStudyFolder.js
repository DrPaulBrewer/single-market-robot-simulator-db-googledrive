/* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global pUploaderForGoogleDrive:false */

/* eslint-disable no-console */

import {driveX} from './extensionsForGoogleDrive';
import arrayPrefer from 'array-prefer';
import { StudyFolder } from 'single-market-robot-simulator-db-studyfolder';
export {driveX, arrayPrefer};

export class StudyFolderForGoogleDrive extends StudyFolder {

    async search(name){
      const trashed = false;
      const folderId = this.id;
      const orderBy = 'modifiedTime desc';
      const searcher = driveX.searcher({
        trashed,
        orderBy
      });
      const response = await searcher(folderId, name);
      return response.files;
    }

    async download({name, id}){
        const fileId = id || (await this.fileId(name));
        const contents = await driveX.contents(fileId);
        if (name.endsWith('.json') && (typeof(contents)==='string'))
            return JSON.parse(contents);
        return contents;
    }

    async update(metadata){
        const folder = this;
        const response = await driveX.updateMetadata(folder.id, metadata);
        return response;
    }

    async upload({name, contents, blob, onProgress, force}){
        const files = await this.listFiles();
        const hasZipFiles = files.some((f)=>(f.name.endsWith(".zip")));
        if ((!force) && (name === 'config.json') && (hasZipFiles))
            throw new Error("conflict Error in upload logic: may not clobber config.json in a study folder with existing .zip file data: config.json unchanged");
        const existingFile = files.filter((f)=>(f.name===name));
        const existingFileId = (Array.isArray(existingFile)) && existingFile[0] && existingFile[0].id;
        const folderId = this.id;
        let myFile = null;
        let mimeType = '';
        if (contents){
            myFile = new Blob([JSON.stringify(contents,null,2)], { type: 'application/json'});
            mimeType = 'application/json';
        }
        if (blob){
            myFile = blob;
            if (name.endsWith(".zip"))
                mimeType = 'application/zip';
            else
                mimeType = blob.type || 'application/octet-stream';
        }
        const metadata = (!existingFileId) && { name, mimeType, parents: [folderId] };
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
