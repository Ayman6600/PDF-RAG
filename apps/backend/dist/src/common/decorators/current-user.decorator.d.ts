import { UserRole } from '@okf-rag/shared-types';
export interface RequestUser {
    userId: string;
    email: string;
    role: UserRole;
    organizationId: string;
}
export declare const CurrentUser: (...dataOrPipes: (keyof RequestUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
