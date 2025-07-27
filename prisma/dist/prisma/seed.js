"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var pricingService_1 = require("../src/services/pricingService");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var plans, _i, plans_1, plan, superAdminRole, allPermissions, _a, allPermissions_1, permission;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, pricingService_1.pricingService.getPlans()];
                case 1:
                    plans = _b.sent();
                    _i = 0, plans_1 = plans;
                    _b.label = 2;
                case 2:
                    if (!(_i < plans_1.length)) return [3 /*break*/, 5];
                    plan = plans_1[_i];
                    return [4 /*yield*/, prisma.plan.upsert({
                            where: { id: plan.id },
                            update: {
                                name: plan.name,
                                monthlyPrice: plan.monthlyPrice,
                                annualPrice: plan.annualPrice,
                                period: plan.period,
                                description: plan.description,
                                features: plan.features,
                                cta: plan.cta,
                                ctaLink: plan.ctaLink,
                                popular: plan.popular,
                                color: plan.color,
                                personasLimit: typeof plan.limits.personas === 'number' ? plan.limits.personas : null,
                                exports: plan.limits.exports,
                                support: plan.limits.support,
                                apiAccess: plan.limits.api,
                                culturalInsights: plan.limits.culturalInsights,
                            },
                            create: {
                                id: plan.id,
                                name: plan.name,
                                monthlyPrice: plan.monthlyPrice,
                                annualPrice: plan.annualPrice,
                                period: plan.period,
                                description: plan.description,
                                features: plan.features,
                                cta: plan.cta,
                                ctaLink: plan.ctaLink,
                                popular: plan.popular,
                                color: plan.color,
                                personasLimit: typeof plan.limits.personas === 'number' ? plan.limits.personas : null,
                                exports: plan.limits.exports,
                                support: plan.limits.support,
                                apiAccess: plan.limits.api,
                                culturalInsights: plan.limits.culturalInsights,
                            },
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: 
                // Add default roles
                return [4 /*yield*/, prisma.role.upsert({
                        where: { name: 'super_admin' },
                        update: { description: 'Utilisateur avec tous les privilèges' },
                        create: { name: 'super_admin', description: 'Utilisateur avec tous les privilèges' },
                    })];
                case 6:
                    // Add default roles
                    _b.sent();
                    return [4 /*yield*/, prisma.role.upsert({
                            where: { name: 'free_user' },
                            update: { description: 'Utilisateur avec le plan gratuit' },
                            create: { name: 'free_user', description: 'Utilisateur avec le plan gratuit' },
                        })];
                case 7:
                    _b.sent();
                    // Add default permissions (example)
                    return [4 /*yield*/, prisma.permission.upsert({
                            where: { name: 'manage_personas' },
                            update: { description: 'Peut gérer les personas' },
                            create: { name: 'manage_personas', description: 'Peut gérer les personas' },
                        })];
                case 8:
                    // Add default permissions (example)
                    _b.sent();
                    return [4 /*yield*/, prisma.permission.upsert({
                            where: { name: 'access_admin_panel' },
                            update: { description: 'Peut accéder au panneau d\'administration' },
                            create: { name: 'access_admin_panel', description: 'Peut accéder au panneau d\'administration' },
                        })];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, prisma.role.findUnique({ where: { name: 'super_admin' } })];
                case 10:
                    superAdminRole = _b.sent();
                    return [4 /*yield*/, prisma.permission.findMany()];
                case 11:
                    allPermissions = _b.sent();
                    if (!superAdminRole) return [3 /*break*/, 15];
                    _a = 0, allPermissions_1 = allPermissions;
                    _b.label = 12;
                case 12:
                    if (!(_a < allPermissions_1.length)) return [3 /*break*/, 15];
                    permission = allPermissions_1[_a];
                    return [4 /*yield*/, prisma.rolePermission.upsert({
                            where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
                            update: {},
                            create: {
                                roleId: superAdminRole.id,
                                permissionId: permission.id,
                            },
                        })];
                case 13:
                    _b.sent();
                    _b.label = 14;
                case 14:
                    _a++;
                    return [3 /*break*/, 12];
                case 15:
                    console.log('Seed data created successfully');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
