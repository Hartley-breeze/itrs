// src/types/shims-md5.d.ts
declare module 'js-md5' {
    interface Md5 {
        (message: string): string;
        hex(message: string): string;
        array(message: string): number[];
        buffer(message: string): ArrayBuffer;
        create(): Md5;
        update(message: string): Md5;
        digest(): string;
    }

    const md5: Md5;
    export default md5;
}