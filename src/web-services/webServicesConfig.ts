import {BFastDatabaseConfig, BFastDatabaseConfigAdapter} from "../bfastDatabaseConfig";
import {SecurityController} from "../controllers/SecurityController";
import {FilesAdapter} from "../adapter/FilesAdapter";
import {S3Storage} from "../factory/S3Storage";
import {GridFsStorage} from "../factory/GridFsStorage";
import {RestController} from "../controllers/RestController";
import {StorageController} from "../controllers/StorageController";
import {DatabaseController} from "../controllers/DatabaseController";
import {Database} from "../factory/Database";
import {Auth} from "../factory/Auth";
import {EmailController} from "../controllers/EmailController";
import {Email} from "../factory/Email";
import {AuthController} from "../controllers/AuthController";

export const getRestController = function () {
    const config: BFastDatabaseConfig = BFastDatabaseConfig.getInstance();
    const emailController = new EmailController((config && config.adapters && config.adapters.email)
        ? config.adapters.email(config)
        : new Email());
    const securityController = new SecurityController();
    const databaseController = new DatabaseController((config && config.adapters && config.adapters.database)
        ? config.adapters.database(config)
        : new Database(config), securityController)
    const authController = new AuthController((config && config.adapters && config.adapters.auth)
        ? config.adapters.auth(config)
        : new Auth(databaseController, securityController, emailController), databaseController)
    const filesAdapter = (config && config.adapters && config.adapters.s3Storage)
        ? new S3Storage(securityController, config)
        : new GridFsStorage(securityController, config)
    const storageController = new StorageController(filesAdapter, config);

    return new RestController(securityController, authController, storageController);
}

export const getAuthController = function () {
    const config: BFastDatabaseConfigAdapter = BFastDatabaseConfig.getInstance();
    const _defaultEmail = (config && config.adapters && config.adapters.email)
        ? config.adapters.email(config)
        : new Email();
    return (config && config.adapters && config.adapters.auth)
        ? config.adapters.auth(config)
        : new Auth(getDatabaseController(), new SecurityController(), new EmailController(_defaultEmail));
}

export const getStorageController = function () {
    const config: BFastDatabaseConfig = BFastDatabaseConfig.getInstance();
    const filesAdapter: FilesAdapter = (config && config.adapters && config.adapters.s3Storage)
        ? new S3Storage(new SecurityController(), config)
        : new GridFsStorage(new SecurityController(), config, config.mongoDbUri);
    return new StorageController(filesAdapter, config);
}

export const getDatabaseController = function () {
    const config: BFastDatabaseConfigAdapter = BFastDatabaseConfig.getInstance();
    return new DatabaseController(
        (config.adapters && config.adapters.database) ?
            this.config.adapters.database(config) : new Database(config),
        new SecurityController()
    );
}
