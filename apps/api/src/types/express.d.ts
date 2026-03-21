declare namespace Express {
  interface Request {
    file?: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    };
  }
}

declare module 'multer' {
  import { Handler } from 'express';
  interface Multer {
    single(field: string): Handler;
    array(field: string, maxCount?: number): Handler;
    fields(fields: Array<{ name: string; maxCount?: number }>): Handler;
    none(): Handler;
    any(): Handler;
  }
  interface Options {
    dest?: string;
    storage?: any;
    limits?: { fileSize?: number };
    fileFilter?: (req: any, file: any, cb: any) => void;
  }
  interface Storage {
    memoryStorage(): any;
  }
  function multer(options?: Options): Multer;
  namespace multer {
    function memoryStorage(): any;
  }
  export = multer;
}
