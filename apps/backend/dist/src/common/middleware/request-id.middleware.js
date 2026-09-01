"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestIdMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RequestIdMiddleware = class RequestIdMiddleware {
    use(req, res, next) {
        const existingId = req.headers['x-request-id'];
        const requestId = existingId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        req.id = requestId;
        req.headers['x-request-id'] = requestId;
        req.startTime = process.hrtime();
        res.setHeader('X-Request-Id', requestId);
        res.on('finish', () => {
            if (req.startTime) {
                const diff = process.hrtime(req.startTime);
                const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
                if (!res.headersSent) {
                    res.setHeader('X-Response-Time', `${durationMs}ms`);
                }
            }
        });
        next();
    }
};
exports.RequestIdMiddleware = RequestIdMiddleware;
exports.RequestIdMiddleware = RequestIdMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestIdMiddleware);
//# sourceMappingURL=request-id.middleware.js.map