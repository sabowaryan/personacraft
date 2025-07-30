/**
 * TemplatePreview Component
 * Read-only preview of a validation template
 */

import React from 'react';
import { ValidationTemplate, ValidationRuleType, ValidationSeverity, FallbackStrategyType } from '@/types/validation';

interface TemplatePreviewProps {
  template: ValidationTemplate;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const getSeverityColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case ValidationSeverity.ERROR:
        return 'text-red-600 bg-red-50 border-red-200';
      case ValidationSeverity.WARNING:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ValidationSeverity.INFO:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: ValidationRuleType) => {
    switch (type) {
      case ValidationRuleType.STRUCTURE:
        return 'text-purple-600 bg-purple-50';
      case ValidationRuleType.CONTENT:
        return 'text-green-600 bg-green-50';
      case ValidationRuleType.FORMAT:
        return 'text-blue-600 bg-blue-50';
      case ValidationRuleType.BUSINESS:
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPersonaTypeColor = (personaType: string) => {
    switch (personaType) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'b2b':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const rulesByType = template.rules.reduce((acc, rule) => {
    if (!acc[rule.type]) {
      acc[rule.type] = [];
    }
    acc[rule.type].push(rule);
    return acc;
  }, {} as Record<ValidationRuleType, typeof template.rules>);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 space-y-6">
        {/* Template Header */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                v{template.version} • {template.id}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPersonaTypeColor(template.personaType)}`}>
                {template.personaType}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                template.metadata.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {template.metadata.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {template.metadata.description && (
            <p className="text-gray-600">{template.metadata.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {template.metadata.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Template Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Metadata</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Author:</span>
                <span className="font-medium">{template.metadata.author}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="font-medium">{new Date(template.metadata.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span className="font-medium">{new Date(template.metadata.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Rules:</span>
                <span className="font-medium">{template.rules.length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Fallback Strategy</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium capitalize">{template.fallbackStrategy.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Retries:</span>
                <span className="font-medium">{template.fallbackStrategy.maxRetries}</span>
              </div>
              {template.fallbackStrategy.fallbackTemplate && (
                <div className="flex justify-between">
                  <span>Fallback Template:</span>
                  <span className="font-medium">{template.fallbackStrategy.fallbackTemplate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Rules */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Rules</h3>
          
          {template.rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No validation rules defined</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(rulesByType).map(([type, rules]) => (
                <div key={type} className="space-y-3">
                  <h4 className="flex items-center text-sm font-medium text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${getTypeColor(type as ValidationRuleType)}`}>
                      {type}
                    </span>
                    {rules.length} rule{rules.length !== 1 ? 's' : ''}
                  </h4>
                  
                  <div className="space-y-2">
                    {rules.map((rule, index) => (
                      <div key={rule.id} className={`border rounded-lg p-4 ${getSeverityColor(rule.severity)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{rule.field}</span>
                            {rule.required && (
                              <span className="text-xs text-red-600 font-medium">Required</span>
                            )}
                            {rule.priority && rule.priority !== 50 && (
                              <span className="text-xs text-gray-500">Priority: {rule.priority}</span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                            {rule.severity}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{rule.message}</p>
                        
                        {rule.dependencies && rule.dependencies.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Dependencies:</span> {rule.dependencies.join(', ')}
                          </div>
                        )}
                        
                        {rule.timeout && rule.timeout !== 5000 && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Timeout:</span> {rule.timeout}ms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rule Statistics */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rule Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {template.rules.filter(r => r.severity === ValidationSeverity.ERROR).length}
              </div>
              <div className="text-sm text-gray-500">Error Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {template.rules.filter(r => r.severity === ValidationSeverity.WARNING).length}
              </div>
              <div className="text-sm text-gray-500">Warning Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {template.rules.filter(r => r.severity === ValidationSeverity.INFO).length}
              </div>
              <div className="text-sm text-gray-500">Info Rules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {template.rules.filter(r => r.required).length}
              </div>
              <div className="text-sm text-gray-500">Required Rules</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}