import {BFast} from "bfastnode";
import {getRestController} from "./webServicesConfig";


const restController = getRestController();

/**
 * support backward parse-server files compatibility
 */
export const getFileFromStorage = BFast.functions().onGetHttpRequest('/v2/files/:applicationId/:filename', [
    (request, _, next) => {
        request.body.applicationId = request.params.applicationId;
        request.body.ruleId = 'files.read'
        next();
    },
    restController.applicationId,
    restController.verifyToken,
    restController.filePolicy,
    restController.getFile
]);

/**
 * get file uploaded to server
 */
export const getFileFromStorageV2 = BFast.functions().onGetHttpRequest('/v2/storage/:appId/file/:filename', [
    (request, _, next) => {
        request.body.applicationId = request.params.appId;
        request.body.ruleId = 'files.read'
        next();
    },
    restController.applicationId,
    restController.verifyToken,
    restController.filePolicy,
    restController.getFile
]);

/**
 * get thumbnail of image
 */
export const geThumbnailFromStorage = BFast.functions().onGetHttpRequest('/v2/storage/:appId/thumbnail/:filename', [
    (request, _, next) => {
        request.body.applicationId = request.params.appId;
        request.body.ruleId = 'files.read'
        next();
    },
    restController.applicationId,
    restController.verifyToken,
    restController.filePolicy,
    restController.getThumbnail
]);

/**
 * list all files in server
 */
export const getFilesFromStorage = BFast.functions().onGetHttpRequest('/v2/storage/:appId/list', [
    (request, _, next) => {
        request.body.applicationId = request.params.appId;
        request.body.ruleId = 'files.list'
        next();
    },
    restController.applicationId,
    restController.verifyToken,
    restController.filePolicy,
    restController.getAllFiles
]);

export const uploadMultiPartFile = BFast.functions().onPostHttpRequest('/v2/storage/:appId', [
    (request, response, next) => {
        request.body.applicationId = request.params.appId;
        request.body.ruleId = 'files.save'
        next();
    },
    restController.applicationId,
    restController.verifyToken,
    restController.filePolicy,
    restController.multipartForm
]);

export const onUploadMultiPartFile = BFast.functions().onGetHttpRequest('/v2/storage/:appId',
    (request, response: any) => {
        // show a file upload form
        response.writeHead(200, {'content-type': 'text/html'});
        response.end(`
    <h2>With Node.js <code>"http"</code> module</h2>
    <form action="/v2/storage/daas" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="multipleFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
    });
