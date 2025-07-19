import { JWTPayload } from '../types';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
//# sourceMappingURL=auth.d.ts.map