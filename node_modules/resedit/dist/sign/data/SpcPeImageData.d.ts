import type DERObject from './DERObject.js';
import ObjectIdentifier from './ObjectIdentifier.js';
import { SpcAttributeTypeAndOptionalValue } from './SpcIndirectDataContent.js';
import type SpcLink from './SpcLink.js';
export declare const SPC_PE_IMAGE_DATA_OBJID: ObjectIdentifier;
declare const SpcPeImageFlags: {
    readonly IncludeResources: 0;
    readonly IncludeDebugInfo: 1;
    readonly IncludeImportAddressTable: 2;
};
type SpcPeImageFlags = (typeof SpcPeImageFlags)[keyof typeof SpcPeImageFlags];
export { SpcPeImageFlags };
export default class SpcPeImageData implements DERObject {
    flags: SpcPeImageFlags;
    file: SpcLink;
    constructor(flags: SpcPeImageFlags, file: SpcLink);
    toDER(): number[];
}
export declare class SpcPeImageAttributeTypeAndOptionalValue extends SpcAttributeTypeAndOptionalValue<SpcPeImageData> {
    constructor(value: SpcPeImageData);
}
