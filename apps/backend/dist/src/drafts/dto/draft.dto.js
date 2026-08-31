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
exports.RefineDraftDto = exports.GenerateDraftDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GenerateDraftDto {
}
exports.GenerateDraftDto = GenerateDraftDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'List of document IDs to use as reference' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateDraftDto.prototype, "documentIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User prompt instructions for drafting' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateDraftDto.prototype, "prompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Draft template (e.g. Executive Memo, Project Proposal, etc.)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateDraftDto.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], required: false, description: 'Optional list of specific section IDs to scope details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateDraftDto.prototype, "sectionIds", void 0);
class RefineDraftDto {
}
exports.RefineDraftDto = RefineDraftDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The original generated markdown draft content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefineDraftDto.prototype, "originalDraft", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Specific modification instructions' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefineDraftDto.prototype, "refineInstruction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], required: false, description: 'Optional list of document IDs to include as reference' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RefineDraftDto.prototype, "documentIds", void 0);
//# sourceMappingURL=draft.dto.js.map