import type DERObject from './DERObject.js';
import type ObjectIdentifier from './ObjectIdentifier.js';
export default class AlgorithmIdentifier implements DERObject {
    algorithm: ObjectIdentifier;
    constructor(algorithm: ObjectIdentifier);
    toDER(): number[];
}
