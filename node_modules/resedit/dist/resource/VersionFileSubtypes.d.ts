declare const VersionFileDriverSubtype: {
    readonly Unknown: 0;
    readonly Printer: 1;
    readonly Keyboard: 2;
    readonly Language: 3;
    readonly Display: 4;
    readonly Mouse: 5;
    readonly Network: 6;
    readonly System: 7;
    readonly Installable: 8;
    readonly Sound: 9;
    readonly Comm: 10;
    readonly VersionedPrinter: 12;
};
type VersionFileDriverSubtype = (typeof VersionFileDriverSubtype)[keyof typeof VersionFileDriverSubtype];
export { VersionFileDriverSubtype };
declare const VersionFileFontSubtype: {
    readonly Unknown: 0;
    readonly Raster: 1;
    readonly Vector: 2;
    readonly TrueType: 3;
};
type VersionFileFontSubtype = (typeof VersionFileFontSubtype)[keyof typeof VersionFileFontSubtype];
export { VersionFileFontSubtype };
