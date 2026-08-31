"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding initial database...');
    const org = await prisma.organization.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corporation',
            slug: 'acme-corp',
        },
    });
    const userPasswordHash = await bcrypt.hash('User123!', 10);
    const standardUser = await prisma.user.upsert({
        where: { email: 'user@acme.com' },
        update: { passwordHash: userPasswordHash, role: client_1.Role.USER },
        create: {
            email: 'user@acme.com',
            name: 'Standard User',
            passwordHash: userPasswordHash,
            role: client_1.Role.USER,
            organizationId: org.id,
        },
    });
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@acme.com' },
        update: { role: client_1.Role.USER },
        create: {
            email: 'admin@acme.com',
            name: 'Acme User',
            passwordHash: userPasswordHash,
            role: client_1.Role.USER,
            organizationId: org.id,
        },
    });
    console.log('Seeding complete!');
    console.log('Org ID:', org.id);
    console.log('Standard User Email:', standardUser.email);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map