/**
 * TemplateEditor Component
 * Form for creating and editing validation templates
 */

import React, { useState, useEffect } from 'react';
import { ValidationTemplate, ValidationRule, PersonaType, ValidationRuleType, ValidationSeverity, FallbackStrategyType } from '@/types/validation';
import { RuleEditor } from './RuleEditor';

interface TemplateEditorProps {
  template: ValidationTemplate;
  onSave: (template: ValidationTemplate) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<ValidationTemplate>(template);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setEditedTemplate(template);
  }, [template]);

  const validateTemplate = (): string[] => {
    const errors: string[] = [];

    // Basic validation
    if (!editedTemplate.name.trim()) {
      errors.push('Template name is required');
    }

    if (!editedTemplate.version.trim()) {
      errors.push('Template version is required');
    }

    if (!editedTemplate.id.trim()) {
      errors.push('Template ID is required');
    }

    // Rule validation
    if (editedTemplate.rules.length === 0) {
      errors.push('At least one validation rule is required');
    }

    // Check for duplicate rule IDs
    const ruleIds = editedTemplate.rules.map(rule => rule.id);
    const duplicateIds = ruleIds.filter((id, index) => ruleIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate rule IDs found: ${duplicateIds.join(', ')}`);
    }

    // Validate each rule
    editedTemplate.rules.forEach((rule, index) => {
      if (!rule.id.trim()) {
        errors.push(`Rule ${index + 1}: ID is required`);
      }
      if (!rule.field.trim()) {
        errors.push(`Rule ${index + 1}: Field is required`);
      }
      if (!rule.message.trim()) {
        errors.push(`Rule ${index + 1}: Message is required`);
      }
    });

    // Fallback strategy validation
    if (editedTemplate.fallbackStrategy.maxRetries < 0) {
      errors.push('Max retries must be 0 or greater');
    }

    return errors;
  };

  const handleSave = async () => {
    setIsValidating(true);
    const errors = validateTemplate();
    setValidationErrors(errors);

    if (errors.length === 0) {
      // Update metadata
      const updatedTemplate = {
        ...editedTemplate,
        metadata: {
          ...editedTemplate.metadata,
          updatedAt: Date.now()
        }
      };
      
      onSave(updatedTemplate);
    }
    
    setIsValidating(false);
  };

  const handleAddRule = () => {
    const newRule: ValidationRule = {
      id: `rule-${Date.now()}`,
      type: ValidationRuleType.STRUCTURE,
      field: '',
      validator: () => ({ isValid: true, errors: [], warnings: [], score: 1, metadata: {} as any }),
      severity: ValidationSeverity.ERROR,
      message: '',
      required: true
    };

    setEditedTemplate(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const handleUpdateRule = (index: number, updatedRule: ValidationRule) => {
    setEditedTemplate(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? updatedRule : rule)
    }));
  };

  const handleDeleteRule = (index: number) => {
    setEditedTemplate(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 space-y-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={editedTemplate.name}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template ID *
            </label>
            <input
              type="text"
              value={editedTemplate.id}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="template-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version *
            </label>
            <input
              type="text"
              value={editedTemplate.version}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, version: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persona Type *
            </label>
            <select
              value={editedTemplate.personaType}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, personaType: e.target.value as PersonaType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={PersonaType.SIMPLE}>Simple</option>
              <option value={PersonaType.STANDARD}>Standard</option>
              <option value={PersonaType.B2B}>B2B</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={editedTemplate.metadata.description}
            onChange={(e) => setEditedTemplate(prev => ({
              ...prev,
              metadata: { ...prev.metadata, description: e.target.value }
            }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what this template validates"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={editedTemplate.metadata.isActive}
            onChange={(e) => setEditedTemplate(prev => ({
              ...prev,
              metadata: { ...prev.metadata, isActive: e.target.checked }
            }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Template is active
          </label>
        </div>

        {/* Fallback Strategy */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fallback Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strategy Type
              </label>
              <select
                value={editedTemplate.fallbackStrategy.type}
                onChange={(e) => setEditedTemplate(prev => ({
                  ...prev,
                  fallbackStrategy: { ...prev.fallbackStrategy, type: e.target.value as FallbackStrategyType }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={FallbackStrategyType.REGENERATE}>Regenerate</option>
                <option value={FallbackStrategyType.SIMPLE_TEMPLATE}>Simple Template</option>
                <option value={FallbackStrategyType.DEFAULT_RESPONSE}>Default Response</option>
                <option value={FallbackStrategyType.NONE}>None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Retries
              </label>
              <input
                type="number"
                min="0"
                value={editedTemplate.fallbackStrategy.maxRetries}
                onChange={(e) => setEditedTemplate(prev => ({
                  ...prev,
                  fallbackStrategy: { ...prev.fallbackStrategy, maxRetries: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {editedTemplate.fallbackStrategy.type === FallbackStrategyType.SIMPLE_TEMPLATE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fallback Template ID
                </label>
                <input
                  type="text"
                  value={editedTemplate.fallbackStrategy.fallbackTemplate || ''}
                  onChange={(e) => setEditedTemplate(prev => ({
                    ...prev,
                    fallbackStrategy: { ...prev.fallbackStrategy, fallbackTemplate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="simple-persona-v1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Validation Rules */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Validation Rules</h3>
            <button
              onClick={handleAddRule}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              Add Rule
            </button>
          </div>

          <div className="space-y-4">
            {editedTemplate.rules.map((rule, index) => (
              <RuleEditor
                key={rule.id}
                rule={rule}
                index={index}
                onUpdate={(updatedRule) => handleUpdateRule(index, updatedRule)}
                onDelete={() => handleDeleteRule(index)}
              />
            ))}

            {editedTemplate.rules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No validation rules defined</p>
                <button
                  onClick={handleAddRule}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add First Rule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isValidating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isValidating ? 'Validating...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}