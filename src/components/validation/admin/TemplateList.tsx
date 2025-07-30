/**
 * TemplateList Component
 * Displays a list of validation templates with basic information
 */

import React from 'react';
import { ValidationTemplate, PersonaType } from '@/types/validation';

interface TemplateListProps {
  templates: ValidationTemplate[];
  selectedTemplate: ValidationTemplate | null;
  onSelectTemplate: (template: ValidationTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export function TemplateList({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onDeleteTemplate
}: TemplateListProps) {
  const getPersonaTypeColor = (personaType: PersonaType) => {
    switch (personaType) {
      case PersonaType.SIMPLE:
        return 'bg-green-100 text-green-800';
      case PersonaType.STANDARD:
        return 'bg-blue-100 text-blue-800';
      case PersonaType.B2B:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (templates.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="mb-4">
          <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p>No templates found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedTemplate?.id === template.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
          onClick={() => onSelectTemplate(template)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {template.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                v{template.version} • {template.id}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTemplate(template.id);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete template"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPersonaTypeColor(template.personaType)}`}>
              {template.personaType}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.metadata.isActive)}`}>
              {template.metadata.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Rules:</span>
              <span className="font-medium">{template.rules.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated:</span>
              <span>{new Date(template.metadata.updatedAt).toLocaleDateString()}</span>
            </div>
            {(template as any).metrics && (
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-medium">
                  {((template as any).metrics.successRate * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {template.metadata.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
              {template.metadata.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}