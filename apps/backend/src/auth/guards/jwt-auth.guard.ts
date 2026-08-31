import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { UserRole } from '@okf-rag/shared-types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private clerkClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
      publishableKey: this.configService.get<string>('CLERK_PUBLISHABLE_KEY'),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (request.query && request.query.token) {
      token = request.query.token as string;
    }

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      // Verify Clerk session token
      const decoded = await verifyToken(token, {
        secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
      });
      const userId = decoded.sub;

      // Find or sync user in our database
      let dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!dbUser) {
        // Fetch full user details from Clerk
        const clerkUser = await this.clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'Clerk User';

        // Find or create default organization
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
            role: 'ADMIN', // Defaulting to ADMIN for access rights in this environment
            organizationId: org.id,
          },
        });
      }

      // Inject request user context compatible with current controllers
      request.user = {
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role as UserRole,
        organizationId: dbUser.organizationId,
      };

      return true;
    } catch (err) {
      console.error('Clerk auth verification error:', err);
      throw new UnauthorizedException('Invalid or expired Clerk token');
    }
  }
}

