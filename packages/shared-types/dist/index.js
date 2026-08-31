"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.DocumentStatus = void 0;
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["UPLOADING"] = "UPLOADING";
    DocumentStatus["PROCESSING"] = "PROCESSING";
    DocumentStatus["INDEXING"] = "INDEXING";
    DocumentStatus["READY"] = "READY";
    DocumentStatus["FAILED"] = "FAILED";
    DocumentStatus["ARCHIVED"] = "ARCHIVED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["USER"] = "USER";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
