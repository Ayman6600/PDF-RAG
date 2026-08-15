import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@okf-rag/shared-types';

export interface RequestUser {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    return data ? user?.[data] : user;
  },
);
