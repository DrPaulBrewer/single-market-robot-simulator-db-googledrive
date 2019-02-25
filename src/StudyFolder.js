/* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global pUploaderForGoogleDrive:false */

/* eslint-disable no-console */

import {driveX} from './extensionsForGoogleDrive';
import * as arrayPrefer from 'array-prefer';
export {driveX, arrayPrefer};

export class StudyFolder {
    constructor(props){
        Object.keys(props).forEach(k => { this[k] = props[k]; });
    }

    async trash(){
        this.trashed = true;
        await this.update({trashed:true});
        return this;
    }

    async untrash(){
        this.trashed = false;
        await this.update({trashed:false});
        return this;
    }

    async getConfig(){
        const folder = this;
        const config = await this.download({ name: 'config.json' });
        const shouldFixName = (config.name && this.name && this.name.length && config.name!==this.name);
        const shouldFixDescription = (config.description && this.description && this.description.length && config.description!==this.description);
        if (shouldFixName) config.name = this.name;
        if (shouldFixDescription) config.description = this.description;
        if (shouldFixName || shouldFixDescription)
            await this.upload({
                name: 'config.json',
                contents: config,
                force: true
            });
        return { config, folder };
    }

    async setConfig({config}){
        if (config && (typeof(config)==='object')){
            if (config.name !== this.name)
                throw new Error(`mismatch at StudyFolder:setConfig configuration name ${config.name} should equal the folder name ${this.name}`);
            await this.upload({ name: 'config.json',  contents: config});
            if (this.description !== config.description){
                this.description = config.description;
                await this.update({description: config.description});
            }
        }
        return this;
    }

    async search(name){
      const trashed = this.trashed;
      const folderId = this.id;
      const orderBy = 'modifiedTime desc';
      const searcher = driveX.searcher({
        trashed,
        orderBy
      });
      const response = await searcher(folderId, name);
      return response.files;
    }

    async listFiles(){
      let files = await this.search();
      if (this.hintFileId){
        files = arrayPrefer(files, (f)=>(f.id===this.hintFileId), 1);
      }
      return files;
    }

    async fileId(name){
        const files = await this.search(name);
        const fileId = files && files[0] && files[0].id;
        return fileId;
    }

    async download({name, id}){
        const fileId = id || (await this.fileId(name));
        const contents = await driveX.contents(fileId);
        if (name.endsWith('.json') && (typeof(contents)==='string'))
            return JSON.parse(contents);
        else
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
        var myFile = null;
        var mimeType = '';
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
        await pUploaderForGoogleDrive({
            file: myFile,
            fileId: existingFileId,
            metadata,
            params: {
                spaces: 'drive',
                fields: 'id,name,mimeType,parents'
            },
            onProgress
        });
        return this;
    }
}
