import { Request, Response, NextFunction } from 'express';
export declare const validateRegister: import("express-validator").ValidationChain[];
export declare const validateLogin: import("express-validator").ValidationChain[];
export declare const validateBlogPost: import("express-validator").ValidationChain[];
export declare const validateUserStatus: import("express-validator").ValidationChain[];
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const isValidUrl: (url: string) => boolean;
export declare const sanitizeHtml: (html: string) => string;
//# sourceMappingURL=validation.d.ts.map