import { PrismaService } from '../database/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getHealth(): {
        status: string;
        timestamp: string;
    };
    getReadiness(): Promise<{
        status: string;
        database: string;
    }>;
    getLiveness(): {
        status: string;
    };
}
