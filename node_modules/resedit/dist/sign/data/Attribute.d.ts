import type DERObject from './DERObject.js';
import type ObjectIdentifier from './ObjectIdentifier.js';
export default class Attribute implements DERObject {
    attrType: ObjectIdentifier;
    attrValues: DERObject[];
    constructor(attrType: ObjectIdentifier, attrValues: DERObject[]);
    toDER(): number[];
}
