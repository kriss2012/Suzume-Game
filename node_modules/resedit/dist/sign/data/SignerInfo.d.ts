import type AlgorithmIdentifier from './AlgorithmIdentifier.js';
import type Attribute from './Attribute.js';
import type DERObject from './DERObject.js';
import type IssuerAndSerialNumber from './IssuerAndSerialNumber.js';
export default class SignerInfo implements DERObject {
    version: number;
    issuerAndSerialNumber: IssuerAndSerialNumber;
    digestAlgorithm: AlgorithmIdentifier;
    digestEncryptionAlgorithm: AlgorithmIdentifier;
    encryptedDigest: Uint8Array;
    authenticatedAttributes?: Attribute[] | undefined;
    unauthenticatedAttributes?: Attribute[] | undefined;
    constructor(version: number, issuerAndSerialNumber: IssuerAndSerialNumber, digestAlgorithm: AlgorithmIdentifier, digestEncryptionAlgorithm: AlgorithmIdentifier, encryptedDigest: Uint8Array, authenticatedAttributes?: Attribute[] | undefined, unauthenticatedAttributes?: Attribute[] | undefined);
    toDER(): number[];
}
