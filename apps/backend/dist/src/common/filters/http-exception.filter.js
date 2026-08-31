"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const requestId = request.headers['x-request-id'] || `req_${Date.now()}`;
        let message = 'Internal server error';
        let code = 'INTERNAL_SERVER_ERROR';
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            }
            else if (typeof res === 'object' && res !== null) {
                const obj = res;
                message = obj.message || exception.message;
                code = obj.error || exception.name;
                details = obj.message !== message ? obj.message : undefined;
            }
        }
        else if (exception instanceof Error) {
            message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
            this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
        }
        const payload = {
            success: false,
            error: {
                code,
                message: Array.isArray(message) ? message.join(', ') : message,
                requestId,
                details,
            },
        };
        response.status(status).json(payload);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map