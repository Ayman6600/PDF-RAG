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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const drafts_service_1 = require("./drafts.service");
const draft_dto_1 = require("./dto/draft.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let DraftsController = class DraftsController {
    constructor(draftsService) {
        this.draftsService = draftsService;
    }
    async generateDraft(dto, user) {
        return this.draftsService.generateDraft(dto, user.organizationId);
    }
    async refineDraft(dto, user) {
        return this.draftsService.refineDraft(dto, user.organizationId);
    }
};
exports.DraftsController = DraftsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a new markdown draft from a template and reference documents' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [draft_dto_1.GenerateDraftDto, Object]),
    __metadata("design:returntype", Promise)
], DraftsController.prototype, "generateDraft", null);
__decorate([
    (0, common_1.Post)('refine'),
    (0, swagger_1.ApiOperation)({ summary: 'Refine/edit an existing draft using user prompt instructions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [draft_dto_1.RefineDraftDto, Object]),
    __metadata("design:returntype", Promise)
], DraftsController.prototype, "refineDraft", null);
exports.DraftsController = DraftsController = __decorate([
    (0, swagger_1.ApiTags)('Drafts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('drafts'),
    __metadata("design:paramtypes", [drafts_service_1.DraftsService])
], DraftsController);
//# sourceMappingURL=drafts.controller.js.map