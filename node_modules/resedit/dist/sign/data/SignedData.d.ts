import type DigestAlgorithmIdentifier from './AlgorithmIdentifier.js';
import type ContentInfo from './ContentInfo.js';
import type DERObject from './DERObject.js';
export default class SignedData implements DERObject {
    version: number;
    digestAlgorithms: DigestAlgorithmIdentifier[];
    contentInfo: ContentInfo;
    signerInfos: DERObject[];
    certificates?: DERObject[] | undefined;
    crls?: DERObject[] | undefined;
    constructor(version: number, digestAlgorithms: DigestAlgorithmIdentifier[], contentInfo: ContentInfo, signerInfos: DERObject[], certificates?: DERObject[] | undefined, crls?: DERObject[] | undefined);
    toDER(): number[];
}
