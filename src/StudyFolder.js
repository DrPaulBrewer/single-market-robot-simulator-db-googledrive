/* Copyright 2018- Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* global driveX: true, pUploaderForGoogleDrive:false */

/* eslint-disable no-console */

export class StudyFolder {
    constructor(props){
        Object.keys(props).forEach(k => { this[k] = props[k]; });
    }

    async trash(){
        this.trashed = true;
        await this.update(); 
        return this;
    }

    async untrash(){
        this.trashed = false;
        await this.update();
        return this;
    }

    async getConfig(){
        const folder = this;
        const config = await this.download({ name: 'config.json' });
        return { config, folder };
    }

    async setConfig({config}){
        if (config && (typeof(config)==='object')){
            if (config.name !== this.name)
                throw new Error(`mismatch at StudyFolder:setConfig configuration name ${config.name} should equal the folder name ${this.name}`);
            if (this.description !== config.description){
                this.description = config.description;
                await this.update();
            }
            await this.upload({ name: 'config.json',  contents: config});
        }
        return this;
    }

    async listFiles(){
        const trashed = this.trashed;
        const folderId = this.id;
        const searcher = driveX.searcher({
            trashed
        });
        const response = await searcher(folderId);
        return response.files; 
    }

    async fileId(name){
        const trashed = this.trashed;
        const fileFinder = driveX.searcher({ trashed });
        const folderId = this.id;
        const response = await fileFinder(folderId, name);
        const fileId = response && response.files && response.files[0] && response.files[0].id;
        return fileId;
    }

    async download({name, id}){
        const fileId = id || (await this.fileId(name));
        const contents = await driveX.contents(fileId);
        if (name.endsWith('.json'))
            return JSON.parse(contents);
        else
            return contents;
    }

    async update(){
	const folder = this;
	const response = await driveX.updateMetadata(folder.id, folder);
	return response;
    }
    
    async upload({name, contents, blob, onProgress}){
        const files = this.listFiles();
        const hasZipFiles = files.some((f)=>(f.names.endsWith(".zip")));
        if ((name === 'config.json') && (hasZipFiles))
            throw new Error("conflict Error in upload logic: may not clobber config.json in a study folder with existing .zip file data: config.json unchanged");
        const existingFile = files.filter((f)=>(f.name===name));
        const existingFileId = existingFile && existingFile.id ;
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
	await pUploaderForGoogleDrive({
            file: myFile,
            fileId: existingFileId,
            metadata: {
                name,
                mimeType,
                parents: [folderId]
            },
            params: {
                spaces: 'drive',
                fields: 'id,name,mimeType,parents'
            },
            onProgress
        });
        return this;
    }
}


