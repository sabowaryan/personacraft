/**
 * RuleEditor Component
 * Editor for individual validation rules within a template
 */

import React, { useState, useEffect } from 'react';
import { ValidationRule, ValidationRuleType, ValidationSeverity } from '@/types/validation';

interface RuleEditorProps {
  rule: ValidationRule;
  index: number;
  onUpdate: (rule: ValidationRule) => void;
  onDelete: () => void;
}

export function RuleEditor({ rule, index, onUpdate, onDelete }: RuleEditorProps) {
  const [editedRule, setEditedRule] = useState<ValidationRule>(rule);
  const [isExpanded, setIsExpanded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setEditedRule(rule);
  }, [rule]);

  const validateRule = (): string[] => {
    const errors: string[] = [];

    if (!editedRule.id.trim()) {
      errors.push('Rule ID is required');
    }

    if (!editedRule.field.trim()) {
      errors.push('Field is required');
    }

    if (!editedRule.message.trim()) {
      errors.push('Message is required');
    }

    return errors;
  };

  const handleUpdate = () => {
    const errors = validateRule();
    setValidationErrors(errors);

    if (errors.length === 0) {
      onUpdate(editedRule);
    }
  };

  const handleFieldChange = (field: keyof ValidationRule, value: any) => {
    const updatedRule = { ...editedRule, [field]: value };
    setEditedRule(updatedRule);
    
    // Auto-update if no validation errors
    const errors = validateRule();
    if (errors.length === 0) {
      onUpdate(updatedRule);
    }
  };

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

  return (
    <div className={`border rounded-lg ${getSeverityColor(editedRule.severity)}`}>
      {/* Rule Header */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
            >
              <svg
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(editedRule.type)}`}>
                {editedRule.type}
              </span>
              <span className="text-sm font-medium">
                Rule {index + 1}: {editedRule.field || 'Unnamed'}
              </span>
              {editedRule.required && (
                <span className="text-xs text-red-600 font-medium">Required</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(editedRule.severity)}`}>
              {editedRule.severity}
            </span>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete rule"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Preview */}
        {!isExpanded && (
          <div className="mt-2 text-sm text-gray-600">
            <p className="truncate">{editedRule.message || 'No message defined'}</p>
          </div>
        )}
      </div>

      {/* Expanded Rule Editor */}
      {isExpanded && (
        <div className="border-t bg-white bg-opacity-50 p-4 space-y-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <h5 className="text-sm font-medium text-red-800 mb-1">Validation Errors:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule ID *
              </label>
              <input
                type="text"
                value={editedRule.id}
                onChange={(e) => handleFieldChange('id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="rule-id"
              />
            </div>

            {/* Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field *
              </label>
              <input
                type="text"
                value={editedRule.field}
                onChange={(e) => handleFieldChange('field', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="field.path"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={editedRule.type}
                onChange={(e) => handleFieldChange('type', e.target.value as ValidationRuleType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ValidationRuleType.STRUCTURE}>Structure</option>
                <option value={ValidationRuleType.CONTENT}>Content</option>
                <option value={ValidationRuleType.FORMAT}>Format</option>
                <option value={ValidationRuleType.BUSINESS}>Business</option>
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity *
              </label>
              <select
                value={editedRule.severity}
                onChange={(e) => handleFieldChange('severity', e.target.value as ValidationSeverity)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ValidationSeverity.ERROR}>Error</option>
                <option value={ValidationSeverity.WARNING}>Warning</option>
                <option value={ValidationSeverity.INFO}>Info</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={editedRule.priority || 50}
                onChange={(e) => handleFieldChange('priority', parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50"
              />
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout (ms)
              </label>
              <input
                type="number"
                min="100"
                value={editedRule.timeout || 5000}
                onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value) || 5000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5000"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Error Message *
            </label>
            <textarea
              value={editedRule.message}
              onChange={(e) => handleFieldChange('message', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this rule validates"
            />
          </div>

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dependencies (comma-separated rule IDs)
            </label>
            <input
              type="text"
              value={editedRule.dependencies?.join(', ') || ''}
              onChange={(e) => handleFieldChange('dependencies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="rule-1, rule-2"
            />
          </div>

          {/* Flags */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`required-${editedRule.id}`}
                checked={editedRule.required}
                onChange={(e) => handleFieldChange('required', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`required-${editedRule.id}`} className="ml-2 block text-sm text-gray-900">
                Required
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button
              onClick={handleUpdate}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Update Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}