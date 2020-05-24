import {FilterModel} from "./FilterModel";

export interface QueryModel<T> {
    skip?: number;
    size?: number;
    orderBy?: Array<{ [P in keyof T]: 1 | -1 }>;
    filter?: FilterModel<T>
    return?: Array<string>;
    _id?: string;
    id?: string; // -> if this field present will ignore all other values except return and will return that specific data or null if not found
}
