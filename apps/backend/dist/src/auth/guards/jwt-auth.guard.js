"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const backend_1 = require("@clerk/backend");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.clerkClient = (0, backend_1.createClerkClient)({
            secretKey: this.configService.get('CLERK_SECRET_KEY'),
            publishableKey: this.configService.get('CLERK_PUBLISHABLE_KEY'),
        });
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        let token = '';
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        else if (request.query && request.query.token) {
            token = request.query.token;
        }
        if (!token) {
            throw new common_1.UnauthorizedException('No authorization token provided');
        }
        try {
            const decoded = await (0, backend_1.verifyToken)(token, {
                secretKey: this.configService.get('CLERK_SECRET_KEY'),
            });
            const userId = decoded.sub;
            let dbUser = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!dbUser) {
                const clerkUser = await this.clerkClient.users.getUser(userId);
                const email = clerkUser.emailAddresses[0]?.emailAddress || '';
                const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'Clerk User';
                let org = await this.prisma.organization.findFirst();
                if (!org) {
                    org = await this.prisma.organization.create({
                        data: {
                            name: 'Acme Corporation',
                            slug: 'acme-corporation',
                        },
                    });
                }
                dbUser = await this.prisma.user.create({
                    data: {
                        id: userId,
                        email,
                        name,
                        passwordHash: '',
                        role: 'ADMIN',
                        organizationId: org.id,
                    },
                });
            }
            request.user = {
                userId: dbUser.id,
                email: dbUser.email,
                role: dbUser.role,
                organizationId: dbUser.organizationId,
            };
            return true;
        }
        catch (err) {
            console.error('Clerk auth verification error:', err);
            throw new common_1.UnauthorizedException('Invalid or expired Clerk token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map