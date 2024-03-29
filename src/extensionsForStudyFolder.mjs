/* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global pUploaderForGoogleDrive:false */

/* eslint-disable no-console */

import {driveX} from './extensionsForGoogleDrive.mjs';
import arrayPrefer from 'array-prefer';
import { StudyFolder } from 'single-market-robot-simulator-db-studyfolder';
import {scan, parse} from 'secure-json-parse';

const secureJSONPolicy = {
  protoAction: 'remove',
  constructorAction: 'remove'
};  // see https://github.com/fastify/secure-json-parse

export {driveX, arrayPrefer};

export class StudyFolderForGoogleDrive extends StudyFolder {

    async search(name){
      const trashed = false;
      const folderId = this.id;
      const orderBy = 'modifiedTime desc';
      const fields = 'id,name,mimeType,modifiedTime,size,properties,webViewLink';
      const searcher = driveX.searcher({
        trashed,
        fields,
        orderBy
      });
      const response = await searcher(folderId, name);
      return response.files;
    }

    async download({name, id}){
        const fileId = id || (await this.fileId(name));
        const contents = await driveX.contents(fileId);
        if (typeof(contents)==='object') scan(contents, secureJSONPolicy);
        if (name.endsWith('.json') && (typeof(contents)==='string'))
            return parse(contents, secureJSONPolicy);
        return contents;
    }

    async update(metadata){
        const folder = this;
        scan(metadata, secureJSONPolicy);
        const response = await driveX.updateMetadata(folder.id, metadata);
        return response;
    }

    async upload({name, contents, description, properties, blob, onProgress, force}){
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
            scan(contents, secureJSONPolicy);
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
        const uploadRequest = {
          file: myFile,
          fileId: existingFileId,
          params: {
              spaces: 'drive',
              fields: 'id,name,mimeType,modifiedTime,size,parents,description,properties,webViewLink'
          },
          onProgress
        };
        if (!existingFileId){
          // the code below prevents creating keys for undefined description, properties
          uploadRequest.metadata = Object.assign(
            {},
            {
              name,
              mimeType,
              parents: [folderId]
            },
            (description && {description}),
            (properties && {properties})
          );
        }
        const uploadedDriveFile = await pUploaderForGoogleDrive(uploadRequest);
        return uploadedDriveFile;
    }
}
