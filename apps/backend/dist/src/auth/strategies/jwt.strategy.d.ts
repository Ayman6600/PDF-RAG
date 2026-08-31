import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@okf-rag/shared-types';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    organizationId: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        email: string;
        role: UserRole;
        organizationId: string;
    }>;
}
export {};
