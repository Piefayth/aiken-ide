import { Constr } from "lucid-cardano";

export function constructObject(json: any): any {
    if (Array.isArray(json)) {
        return json.map(item => constructObject(item));
    } else if ('constructor' in json && Array.isArray(json.fields)) {
        const fields = json.fields.map((field: any) => {
            if (typeof field === 'object' && field !== null) {
                return constructObject(field);
            } else {
                return field;
            }
        });
        return new Constr(json.constructor, fields);
    } else if ('bytes' in json) {
        return json.bytes;
    } else if ('int' in json) {
        return json.int;
    } else if ('map_0' in json) {
        throw new Error("Map type encountered, operation not supported");
    } else {
        throw new Error("Unknown type in JSON structure");
    }
}