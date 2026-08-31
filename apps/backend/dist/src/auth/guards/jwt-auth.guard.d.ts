import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly prisma;
    private readonly configService;
    private clerkClient;
    constructor(prisma: PrismaService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
