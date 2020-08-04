import {FilesAdapter} from "../adapter/FilesAdapter";
import {FileModel} from "../model/FileModel";
import {ContextBlock} from "../model/RulesBlockModel";
import mime from "mime";

let _fileAdapter: FilesAdapter;

export class StorageController {
    constructor(filesAdapter: FilesAdapter) {
        _fileAdapter = filesAdapter;
    }

    async save(fileModel: FileModel, context: ContextBlock): Promise<string> {
        let {filename, data, type} = fileModel;
        if (!filename) {
            throw 'Filename required';
        }
        if (!data) {
            throw 'File base64 data to save is required';
        }
        if (!type) {
            type = mime.getType(filename);
        }
        const _source = StorageController.getSource(data, type);
        const dataToSave: {
            type?: any,
            data: any,
            filename: string,
            fileData: Object,
        } = {
            data: _source.base64,
            filename: filename,
            fileData: {
                metadata: {},
                tags: {},
            },
        }
        if (_source.type) {
            dataToSave.type = _source.type;
        }
        const isBase64 = Buffer.from(dataToSave.data, 'base64').toString('base64') === dataToSave.data;
        const file = await _fileAdapter.createFile(
            dataToSave.filename,
            isBase64 === true ?
                Buffer.from(dataToSave.data, 'base64')
                : dataToSave.data,
            dataToSave?.type,
            {}
        );
        return _fileAdapter.getFileLocation(file);
    }

    async saveFromBuffer(fileModel: { filename: string, data: Buffer, type: string }, context: ContextBlock): Promise<string> {
        let {filename, data, type} = fileModel;
        if (!filename) {
            throw 'Filename required';
        }
        if (!data) {
            throw 'File base64 data to save is required';
        }
        if (!type) {
            type = mime.getType(filename);
        }
        const file = await _fileAdapter.createFile(
            filename,
            data,
            type,
            {}
        );
        return _fileAdapter.getFileLocation(file);
    }

    async delete(data: { filename: string }, context: ContextBlock): Promise<string> {
        const {filename} = data;
        if (!filename) {
            throw 'Filename required';
        }
        await _fileAdapter.deleteFile(filename);
        return filename;
    }

    private static getSource(base64: string, type: string) {
        let _data: string;
        let _source: {
            format: string,
            base64: string,
            type: any;
        };
        const dataUriRegexp = /^data:([a-zA-Z]+\/[-a-zA-Z0-9+.]+)(;charset=[a-zA-Z0-9\-\/]*)?;base64,/;
        const commaIndex = base64.indexOf(',');

        if (commaIndex !== -1) {
            const matches = dataUriRegexp.exec(base64.slice(0, commaIndex + 1));
            // if data URI with type and charset, there will be 4 matches.
            _data = base64.slice(commaIndex + 1);
            _source = {
                format: 'base64',
                base64: _data,
                type: matches && matches.length > 0 ? matches[1] : type
            };
        } else {
            _data = base64;
            _source = {
                format: 'base64',
                base64: _data,
                type: type
            };
        }
        return _source;
    }
}
