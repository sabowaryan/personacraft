/**
 * B2B Persona Validation Template
 * Specialized validation rules for B2B personas with professional context
 */

import {
    ValidationTemplate,
    ValidationRule,
    ValidationRuleType,
    ValidationSeverity,
    PersonaType,
    FallbackStrategyType
} from '@/types/validation';

import { validateRequiredFields, validateCulturalDataStructure, validateJSONStructure } from '@/lib/validators/structure-validators';
import { validateAgeRange, validateLocationFormat, validateCulturalDataConsistency, validateIncomeRange, validateOccupationConsistency } from '@/lib/validators/content-validators';
import { validateEmailFormat, validatePhoneFormat, validateDateFormat, validateArrayFormat } from '@/lib/validators/format-validators';

/**
 * B2B persona template with professional-focused validation rules
 */
export const b2bPersonaTemplate: ValidationTemplate = {
    id: 'b2b-persona-v1',
    name: 'B2B Persona Validation',
    version: '1.0.0',
    personaType: PersonaType.B2B,
    rules: [
        // Structure validation rules - B2B specific
        {
            id: 'required-fields-b2b',
            type: ValidationRuleType.STRUCTURE,
            field: 'root',
            validator: validateRequiredFields([
                'id',
                'name',
                'age',
                'occupation',
                'location',
                'company',
                'bio',
                'quote',
                'demographics',
                'psychographics',
                'businessPainPoints',
                'businessGoals',
                'decisionMaking',
                'marketingInsights',
                'qualityScore'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Missing required B2B fields',
            required: true,
            priority: 1
        },
        {
            id: 'json-structure',
            type: ValidationRuleType.STRUCTURE,
            field: 'root',
            validator: validateJSONStructure(),
            severity: ValidationSeverity.ERROR,
            message: 'Invalid JSON structure',
            required: true,
            priority: 1
        },
        {
            id: 'professional-profile-structure',
            type: ValidationRuleType.STRUCTURE,
            field: 'professionalProfile',
            validator: validateRequiredFields([
                'professionalProfile.experience',
                'professionalProfile.skills',
                'professionalProfile.responsibilities',
                'professionalProfile.decisionMakingAuthority'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Professional profile must contain required fields',
            required: true,
            priority: 2
        },
        {
            id: 'company-structure',
            type: ValidationRuleType.STRUCTURE,
            field: 'company',
            validator: validateCompanyStructure(),
            severity: ValidationSeverity.ERROR,
            message: 'Company information must be properly structured',
            required: true,
            priority: 2
        },

        // Content validation rules - B2B specific
        {
            id: 'job-title-validation',
            type: ValidationRuleType.CONTENT,
            field: 'jobTitle',
            validator: validateJobTitle(),
            severity: ValidationSeverity.ERROR,
            message: 'Job title must be professional and realistic',
            required: true,
            priority: 3
        },
        {
            id: 'industry-validation',
            type: ValidationRuleType.CONTENT,
            field: 'industry',
            validator: validateIndustry(),
            severity: ValidationSeverity.ERROR,
            message: 'Industry must be from recognized business categories',
            required: true,
            priority: 3
        },
        {
            id: 'seniority-validation',
            type: ValidationRuleType.CONTENT,
            field: 'seniority',
            validator: validateSeniority(),
            severity: ValidationSeverity.ERROR,
            message: 'Seniority level must be valid business hierarchy level',
            required: true,
            priority: 3
        },
        {
            id: 'company-size-validation',
            type: ValidationRuleType.CONTENT,
            field: 'company.size',
            validator: validateCompanySize(),
            severity: ValidationSeverity.ERROR,
            message: 'Company size must be within realistic business ranges',
            required: true,
            priority: 3
        },
        {
            id: 'professional-experience-validation',
            type: ValidationRuleType.CONTENT,
            field: 'professionalProfile.experience',
            validator: validateProfessionalExperience(),
            severity: ValidationSeverity.ERROR,
            message: 'Professional experience must be realistic and consistent',
            required: true,
            priority: 3
        },
        {
            id: 'decision-authority-validation',
            type: ValidationRuleType.CONTENT,
            field: 'professionalProfile.decisionMakingAuthority',
            validator: validateDecisionAuthority(),
            severity: ValidationSeverity.WARNING,
            message: 'Decision making authority should align with seniority level',
            required: false,
            priority: 4
        },

        // Format validation rules
        {
            id: 'business-email-format',
            type: ValidationRuleType.FORMAT,
            field: 'email',
            validator: validateBusinessEmailFormat(),
            severity: ValidationSeverity.ERROR,
            message: 'Business email should be professional format',
            required: true,
            priority: 3
        },
        {
            id: 'phone-format-business',
            type: ValidationRuleType.FORMAT,
            field: 'phone',
            validator: validatePhoneFormat(['international', 'national']),
            severity: ValidationSeverity.WARNING,
            message: 'Business phone should be in professional format',
            required: false,
            priority: 5
        },
        {
            id: 'array-format-skills',
            type: ValidationRuleType.FORMAT,
            field: 'professionalProfile.skills',
            validator: validateArrayFormat({
                'professionalProfile.skills': {
                    minLength: 3,
                    maxLength: 25,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Skills should be a comprehensive array of professional competencies',
            required: true,
            priority: 3
        },
        {
            id: 'array-format-responsibilities',
            type: ValidationRuleType.FORMAT,
            field: 'professionalProfile.responsibilities',
            validator: validateArrayFormat({
                'professionalProfile.responsibilities': {
                    minLength: 2,
                    maxLength: 15,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Responsibilities should be a detailed array of job duties',
            required: true,
            priority: 3
        },

        // Business validation rules - B2B specific
        {
            id: 'role-consistency-validation',
            type: ValidationRuleType.BUSINESS,
            field: 'root',
            validator: validateRoleConsistency(),
            severity: ValidationSeverity.WARNING,
            message: 'Job title, seniority, and responsibilities should be consistent',
            required: false,
            priority: 4
        },
        {
            id: 'pain-points-validation',
            type: ValidationRuleType.BUSINESS,
            field: 'painPoints',
            validator: validatePainPoints(),
            severity: ValidationSeverity.ERROR,
            message: 'B2B personas must have relevant professional pain points',
            required: true,
            priority: 3
        },
        {
            id: 'buying-behavior-validation',
            type: ValidationRuleType.BUSINESS,
            field: 'buyingBehavior',
            validator: validateBuyingBehavior(),
            severity: ValidationSeverity.ERROR,
            message: 'B2B buying behavior must be professionally relevant',
            required: true,
            priority: 3
        },
        {
            id: 'kpi-metrics-validation',
            type: ValidationRuleType.BUSINESS,
            field: 'professionalProfile.kpiMetrics',
            validator: validateKPIMetrics(),
            severity: ValidationSeverity.WARNING,
            message: 'KPI metrics should align with role and industry',
            required: false,
            priority: 4
        }
    ],
    fallbackStrategy: {
        type: FallbackStrategyType.SIMPLE_TEMPLATE,
        maxRetries: 3,
        fallbackTemplate: 'simple-persona-v1',
        retryDelay: 1000,
        backoffMultiplier: 1.5
    },
    metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        author: 'Qloo Validation System',
        description: 'Specialized validation template for B2B personas with professional context and business requirements',
        tags: ['b2b', 'professional', 'business', 'enterprise'],
        isActive: true,
        supportedLLMs: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro']
    }
};

/**
 * Validates company structure for B2B personas
 */
function validateCompanyStructure() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (!value || typeof value !== 'object') {
            errors.push({
                id: 'company-structure-missing',
                type: 'STRUCTURE_INVALID',
                field: 'company',
                message: 'Company information is required for B2B personas',
                severity: 'ERROR',
                value,
                expectedValue: 'Object with company data',
                context: {}
            });
        } else {
            const requiredFields = ['name', 'size', 'industry', 'location'];
            requiredFields.forEach(field => {
                if (!value[field]) {
                    errors.push({
                        id: `company-${field}-missing`,
                        type: 'REQUIRED_FIELD_MISSING',
                        field: `company.${field}`,
                        message: `Company ${field} is required`,
                        severity: 'ERROR',
                        value: undefined,
                        expectedValue: `Company ${field}`,
                        context: { field }
                    });
                }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 25)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates job title for professional relevance
 */
function validateJobTitle() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (typeof value !== 'string' || value.trim().length === 0) {
            errors.push({
                id: 'job-title-invalid',
                type: 'TYPE_MISMATCH',
                field: 'jobTitle',
                message: 'Job title must be a non-empty string',
                severity: 'ERROR',
                value,
                expectedValue: 'Professional job title string',
                context: {}
            });
        } else {
            const jobTitle = value.trim();
            
            // Check for minimum professional length
            if (jobTitle.length < 3) {
                errors.push({
                    id: 'job-title-too-short',
                    type: 'VALUE_OUT_OF_RANGE',
                    field: 'jobTitle',
                    message: 'Job title is too short to be professional',
                    severity: 'ERROR',
                    value: jobTitle.length,
                    expectedValue: '>= 3 characters',
                    context: {}
                });
            }

            // Check for unprofessional terms
            const unprofessionalTerms = ['ninja', 'rockstar', 'guru', 'wizard'];
            const hasUnprofessionalTerm = unprofessionalTerms.some(term => 
                jobTitle.toLowerCase().includes(term)
            );
            
            if (hasUnprofessionalTerm) {
                warnings.push({
                    id: 'job-title-unprofessional',
                    field: 'jobTitle',
                    message: 'Job title contains informal terms that may not be suitable for B2B context',
                    value: jobTitle,
                    suggestion: 'Use more formal professional titles'
                });
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 85) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates industry classification
 */
function validateIndustry() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (typeof value !== 'string' || value.trim().length === 0) {
            errors.push({
                id: 'industry-invalid',
                type: 'TYPE_MISMATCH',
                field: 'industry',
                message: 'Industry must be a non-empty string',
                severity: 'ERROR',
                value,
                expectedValue: 'Valid industry classification',
                context: {}
            });
        } else {
            const industry = value.trim();
            
            // Common industry categories for validation
            const validIndustries = [
                'technology', 'healthcare', 'finance', 'manufacturing', 'retail',
                'education', 'consulting', 'media', 'telecommunications', 'automotive',
                'aerospace', 'energy', 'real estate', 'hospitality', 'transportation',
                'agriculture', 'construction', 'pharmaceuticals', 'biotechnology',
                'software', 'hardware', 'services', 'government', 'non-profit'
            ];

            const isValidIndustry = validIndustries.some(validInd => 
                industry.toLowerCase().includes(validInd) || 
                validInd.includes(industry.toLowerCase())
            );

            if (!isValidIndustry && industry.length < 50) {
                warnings.push({
                    id: 'industry-unrecognized',
                    field: 'industry',
                    message: 'Industry may not be from standard business classifications',
                    value: industry,
                    suggestion: 'Use recognized industry categories for better B2B relevance'
                });
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 90) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates seniority level
 */
function validateSeniority() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (typeof value !== 'string' || value.trim().length === 0) {
            errors.push({
                id: 'seniority-invalid',
                type: 'TYPE_MISMATCH',
                field: 'seniority',
                message: 'Seniority must be a non-empty string',
                severity: 'ERROR',
                value,
                expectedValue: 'Valid seniority level',
                context: {}
            });
        } else {
            const seniority = value.trim().toLowerCase();
            const validSeniorityLevels = [
                'entry', 'junior', 'mid', 'senior', 'lead', 'principal',
                'manager', 'director', 'vp', 'vice president', 'c-level',
                'executive', 'associate', 'specialist', 'coordinator'
            ];

            const isValidSeniority = validSeniorityLevels.some(level => 
                seniority.includes(level) || level.includes(seniority)
            );

            if (!isValidSeniority) {
                errors.push({
                    id: 'seniority-unrecognized',
                    type: 'VALUE_OUT_OF_RANGE',
                    field: 'seniority',
                    message: 'Seniority level not recognized as standard business hierarchy',
                    severity: 'ERROR',
                    value,
                    expectedValue: 'Standard business seniority level',
                    context: { validLevels: validSeniorityLevels }
                });
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? 100 : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates company size
 */
function validateCompanySize() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (typeof value === 'number') {
            if (value < 1 || value > 1000000) {
                errors.push({
                    id: 'company-size-out-of-range',
                    type: 'VALUE_OUT_OF_RANGE',
                    field: 'company.size',
                    message: 'Company size must be between 1 and 1,000,000 employees',
                    severity: 'ERROR',
                    value,
                    expectedValue: '1-1,000,000',
                    context: {}
                });
            }
        } else if (typeof value === 'string') {
            const sizeCategories = ['startup', 'small', 'medium', 'large', 'enterprise'];
            const isValidCategory = sizeCategories.some(cat => 
                value.toLowerCase().includes(cat)
            );
            
            if (!isValidCategory) {
                warnings.push({
                    id: 'company-size-category-unrecognized',
                    field: 'company.size',
                    message: 'Company size category may not be standard',
                    value,
                    suggestion: 'Use standard categories: startup, small, medium, large, enterprise'
                });
            }
        } else {
            errors.push({
                id: 'company-size-invalid-type',
                type: 'TYPE_MISMATCH',
                field: 'company.size',
                message: 'Company size must be a number or size category string',
                severity: 'ERROR',
                value,
                expectedValue: 'Number or size category string',
                context: {}
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 90) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Additional B2B-specific validators
 */
function validateProfessionalExperience() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (typeof value === 'number') {
            if (value < 0 || value > 50) {
                errors.push({
                    id: 'experience-out-of-range',
                    type: 'VALUE_OUT_OF_RANGE',
                    field: 'professionalProfile.experience',
                    message: 'Professional experience must be between 0 and 50 years',
                    severity: 'ERROR',
                    value,
                    expectedValue: '0-50 years',
                    context: {}
                });
            }
        } else if (typeof value === 'string') {
            // Try to extract years from string
            const yearMatch = value.match(/(\d+)\s*years?/i);
            if (yearMatch) {
                const years = parseInt(yearMatch[1]);
                if (years < 0 || years > 50) {
                    errors.push({
                        id: 'experience-string-out-of-range',
                        type: 'VALUE_OUT_OF_RANGE',
                        field: 'professionalProfile.experience',
                        message: 'Experience years extracted from string are out of range',
                        severity: 'ERROR',
                        value: years,
                        expectedValue: '0-50 years',
                        context: { originalString: value }
                    });
                }
            }
        } else {
            errors.push({
                id: 'experience-invalid-type',
                type: 'TYPE_MISMATCH',
                field: 'professionalProfile.experience',
                message: 'Experience must be a number or descriptive string',
                severity: 'ERROR',
                value,
                expectedValue: 'Number of years or experience description',
                context: {}
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? 100 : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

function validateDecisionAuthority() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (typeof value !== 'string' || value.trim().length === 0) {
            warnings.push({
                id: 'decision-authority-missing',
                field: 'professionalProfile.decisionMakingAuthority',
                message: 'Decision making authority should be specified for B2B personas',
                value,
                suggestion: 'Include decision making scope and authority level'
            });
        } else {
            const authority = value.toLowerCase();
            const authorityLevels = ['none', 'limited', 'moderate', 'high', 'full', 'influencer', 'decision maker', 'approver'];
            
            const hasValidAuthority = authorityLevels.some(level => 
                authority.includes(level)
            );

            if (!hasValidAuthority) {
                warnings.push({
                    id: 'decision-authority-unclear',
                    field: 'professionalProfile.decisionMakingAuthority',
                    message: 'Decision making authority level is not clearly defined',
                    value,
                    suggestion: 'Use clear authority levels like: none, limited, moderate, high, full'
                });
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 80) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

function validateBusinessEmailFormat() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (typeof value !== 'string' || value.trim().length === 0) {
            errors.push({
                id: 'business-email-missing',
                type: 'REQUIRED_FIELD_MISSING',
                field: 'email',
                message: 'Business email is required for B2B personas',
                severity: 'ERROR',
                value,
                expectedValue: 'Professional email address',
                context: {}
            });
        } else {
            const email = value.trim();
            
            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push({
                    id: 'business-email-invalid-format',
                    type: 'FORMAT_INVALID',
                    field: 'email',
                    message: 'Email format is invalid',
                    severity: 'ERROR',
                    value: email,
                    expectedValue: 'Valid email format',
                    context: {}
                });
            } else {
                // Check for personal email domains
                const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
                const domain = email.split('@')[1]?.toLowerCase();
                
                if (personalDomains.includes(domain)) {
                    warnings.push({
                        id: 'business-email-personal-domain',
                        field: 'email',
                        message: 'Email uses personal domain, consider business domain for B2B context',
                        value: email,
                        suggestion: 'Use corporate email domain for better B2B authenticity'
                    });
                }
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 85) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

function validateRoleConsistency() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        const jobTitle = value.jobTitle?.toLowerCase() || '';
        const seniority = value.seniority?.toLowerCase() || '';
        
        // Check consistency between job title and seniority
        if (jobTitle.includes('director') && !seniority.includes('senior') && !seniority.includes('director')) {
            warnings.push({
                id: 'role-consistency-director-seniority',
                field: 'root',
                message: 'Director job title should typically have senior or director-level seniority',
                value: { jobTitle: value.jobTitle, seniority: value.seniority },
                suggestion: 'Align job title with appropriate seniority level'
            });
        }

        if (jobTitle.includes('manager') && seniority.includes('entry')) {
            warnings.push({
                id: 'role-consistency-manager-entry',
                field: 'root',
                message: 'Manager role typically requires more than entry-level seniority',
                value: { jobTitle: value.jobTitle, seniority: value.seniority },
                suggestion: 'Consider mid-level or senior seniority for management roles'
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 85) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

function validatePainPoints() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (!value || (!Array.isArray(value) && typeof value !== 'object')) {
            errors.push({
                id: 'pain-points-missing',
                type: 'REQUIRED_FIELD_MISSING',
                field: 'painPoints',
                message: 'Pain points are required for B2B personas',
                severity: 'ERROR',
                value,
                expectedValue: 'Array or object with professional pain points',
                context: {}
            });
        } else if (Array.isArray(value)) {
            if (value.length === 0) {
                errors.push({
                    id: 'pain-points-empty',
                    type: 'VALUE_OUT_OF_RANGE',
                    field: 'painPoints',
                    message: 'Pain points array cannot be empty for B2B personas',
                    severity: 'ERROR',
                    value: value.length,
                    expectedValue: '>= 1 pain point',
                    context: {}
                });
            } else if (value.length < 2) {
                warnings.push({
                    id: 'pain-points-few',
                    field: 'painPoints',
                    message: 'Consider adding more pain points for comprehensive B2B persona',
                    value: value.length,
                    suggestion: 'Include 2-5 relevant professional pain points'
                });
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 85) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

function validateBuyingBehavior() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (!value || typeof value !== 'object') {
            errors.push({
                id: 'buying-behavior-missing',
                type: 'REQUIRED_FIELD_MISSING',
                field: 'buyingBehavior',
                message: 'Buying behavior is required for B2B personas',
                severity: 'ERROR',
                value,
                expectedValue: 'Object with B2B buying behavior data',
                context: {}
            });
        } else {
            const requiredFields = ['decisionProcess', 'budgetAuthority', 'evaluationCriteria'];
            requiredFields.forEach(field => {
                if (!value[field]) {
                    warnings.push({
                        id: `buying-behavior-${field}-missing`,
                        field: `buyingBehavior.${field}`,
                        message: `${field} should be included in B2B buying behavior`,
                        value: undefined,
                        suggestion: `Add ${field} information for comprehensive B2B profile`
                    });
                }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 80) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

function validateKPIMetrics() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (value && Array.isArray(value)) {
            if (value.length === 0) {
                warnings.push({
                    id: 'kpi-metrics-empty',
                    field: 'professionalProfile.kpiMetrics',
                    message: 'KPI metrics array is empty, consider adding relevant metrics',
                    value: value.length,
                    suggestion: 'Include 2-5 relevant KPIs for the role'
                });
            } else {
                // Check if KPIs are meaningful strings
                value.forEach((kpi, index) => {
                    if (typeof kpi !== 'string' || kpi.trim().length < 3) {
                        warnings.push({
                            id: `kpi-metric-invalid-${index}`,
                            field: `professionalProfile.kpiMetrics[${index}]`,
                            message: 'KPI metric should be a meaningful description',
                            value: kpi,
                            suggestion: 'Use specific, measurable KPI descriptions'
                        });
                    }
                });
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 85) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'b2b-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}