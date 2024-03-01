import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由角色
    const roles = this.reflector.get('roles', context.getHandler());
    if (!roles) return true;

    // 读取user
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    // 判断用户的角色是否包含和roles相同的角色列表
    const hasRoles = roles.some((role) => role === user.role);
    return hasRoles;
  }
}
