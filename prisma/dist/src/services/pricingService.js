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
exports.pricingService = void 0;
var PricingService = /** @class */ (function () {
    function PricingService() {
        this.plans = [
            {
                id: 'free',
                name: "Gratuit",
                monthlyPrice: "0€",
                annualPrice: "0€",
                period: "/mois",
                description: "Parfait pour découvrir PersonaCraft",
                features: [
                    "3 personas par mois",
                    "Export PDF basique",
                    "Support communautaire"
                ],
                cta: "Commencer gratuitement",
                ctaLink: "/dashboard",
                popular: false,
                color: "purple",
                limits: {
                    personas: 3,
                    exports: ['PDF'],
                    support: 'Communauté',
                    api: false,
                    culturalInsights: false
                }
            },
            {
                id: 'pro',
                name: "Pro",
                monthlyPrice: "29€",
                annualPrice: "23€",
                period: "/mois",
                description: "Pour les marketeurs professionnels",
                features: [
                    "50 personas par mois",
                    "Export JSON, CSV, PDF",
                    "Insights culturels avancés",
                    "Support prioritaire"
                ],
                cta: "Essayer Pro",
                ctaLink: "/dashboard?plan=pro",
                popular: true,
                color: "gradient",
                limits: {
                    personas: 50,
                    exports: ['PDF', 'JSON', 'CSV'],
                    support: 'Prioritaire',
                    api: true,
                    culturalInsights: true
                }
            },
            {
                id: 'enterprise',
                name: "Enterprise",
                monthlyPrice: "99€",
                annualPrice: "79€",
                period: "/mois",
                description: "Pour les grandes équipes et agences",
                features: [
                    "Personas illimités",
                    "API personnalisée",
                    "Intégrations avancées",
                    "Support dédié 24/7"
                ],
                cta: "Nous contacter",
                ctaLink: "/contact",
                popular: false,
                color: "purple",
                limits: {
                    personas: 'unlimited',
                    exports: ['PDF', 'JSON', 'CSV', 'API'],
                    support: 'Dédié 24/7',
                    api: true,
                    culturalInsights: true
                }
            }
        ];
        this.faqs = [
            {
                question: "Puis-je changer de plan à tout moment ?",
                answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et nous calculons le prorata pour la facturation."
            },
            {
                question: "Y a-t-il une période d'essai ?",
                answer: "Le plan gratuit vous permet de tester PersonaCraft sans engagement. Le plan Pro offre 14 jours d'essai gratuit, sans carte de crédit requise."
            },
            {
                question: "Les données sont-elles sécurisées ?",
                answer: "Absolument. Nous utilisons un chiffrement AES-256, respectons le RGPD et stockons vos données sur des serveurs européens certifiés ISO 27001."
            },
            {
                question: "Support technique inclus ?",
                answer: "Tous les plans incluent un support. Le plan gratuit a accès à la communauté, Pro bénéficie d'un support prioritaire, et Enterprise d'un support dédié 24/7."
            },
            {
                question: "Puis-je annuler à tout moment ?",
                answer: "Oui, vous pouvez annuler votre abonnement à tout moment. Aucun frais d'annulation, et vous gardez l'accès jusqu'à la fin de votre période de facturation."
            },
            {
                question: "Offrez-vous des réductions pour les étudiants ?",
                answer: "Oui, nous offrons 50% de réduction sur le plan Pro pour les étudiants et enseignants avec une adresse email académique valide."
            },
            {
                question: "Qu'est-ce qui est inclus dans l'API ?",
                answer: "L'API permet d'intégrer PersonaCraft dans vos outils existants, d'automatiser la génération de personas et d'exporter les données dans vos systèmes CRM ou marketing."
            },
            {
                question: "Comment fonctionne la facturation ?",
                answer: "La facturation est mensuelle ou annuelle (avec 2 mois gratuits). Nous acceptons toutes les cartes de crédit principales et les virements SEPA pour les entreprises."
            }
        ];
    }
    /**
     * Récupère tous les plans de pricing
     */
    PricingService.prototype.getPlans = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Simulation d'un appel API
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(_this.plans);
                        }, 100);
                    })];
            });
        });
    };
    /**
     * Récupère un plan spécifique par son ID
     */
    PricingService.prototype.getPlanById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            var plan = _this.plans.find(function (p) { return p.id === id; });
                            resolve(plan || null);
                        }, 100);
                    })];
            });
        });
    };
    /**
     * Récupère les FAQs
     */
    PricingService.prototype.getFAQs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(_this.faqs);
                        }, 100);
                    })];
            });
        });
    };
    /**
     * Calcule le prix avec remise annuelle
     */
    PricingService.prototype.calculateAnnualDiscount = function (monthlyPrice) {
        var monthly = parseFloat(monthlyPrice.replace('€', ''));
        if (monthly === 0)
            return { discount: 0, savings: '0€' };
        var discount = 0.2; // 20% de remise
        var savings = (monthly * 12 * discount).toFixed(0);
        return {
            discount: discount,
            savings: "".concat(savings, "\u20AC")
        };
    };
    /**
     * Vérifie si un plan a une fonctionnalité spécifique
     */
    PricingService.prototype.planHasFeature = function (planId, feature) {
        var plan = this.plans.find(function (p) { return p.id === planId; });
        if (!plan)
            return false;
        var featureValue = plan.limits[feature];
        return featureValue === true || (Array.isArray(featureValue) && featureValue.length > 0);
    };
    /**
     * Compare deux plans
     */
    PricingService.prototype.comparePlans = function (planId1, planId2) {
        var plan1 = this.plans.find(function (p) { return p.id === planId1; }) || null;
        var plan2 = this.plans.find(function (p) { return p.id === planId2; }) || null;
        var differences = [];
        if (plan1 && plan2) {
            // Comparer les limites de personas
            if (plan1.limits.personas !== plan2.limits.personas) {
                differences.push("Personas: ".concat(plan1.limits.personas, " vs ").concat(plan2.limits.personas));
            }
            // Comparer les exports
            var exports1 = plan1.limits.exports.join(', ');
            var exports2 = plan2.limits.exports.join(', ');
            if (exports1 !== exports2) {
                differences.push("Exports: ".concat(exports1, " vs ").concat(exports2));
            }
            // Comparer le support
            if (plan1.limits.support !== plan2.limits.support) {
                differences.push("Support: ".concat(plan1.limits.support, " vs ").concat(plan2.limits.support));
            }
        }
        return { plan1: plan1, plan2: plan2, differences: differences };
    };
    return PricingService;
}());
exports.pricingService = new PricingService();
