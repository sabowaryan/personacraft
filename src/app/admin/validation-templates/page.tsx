/**
 * Template Administration Interface
 * Main page for managing validation templates
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ValidationTemplate, PersonaType } from '@/types/validation';
import { TemplateEditor } from '@/components/validation/admin/TemplateEditor';
import { TemplateList } from '@/components/validation/admin/TemplateList';
import { TemplatePreview } from '@/components/validation/admin/TemplatePreview';
import { TemplateValidator } from '@/components/validation/admin/TemplateValidator';

interface TemplateAdminState {
  templates: ValidationTemplate[];
  selectedTemplate: ValidationTemplate | null;
  isEditing: boolean;
  isCreating: boolean;
  loading: boolean;
  error: string | null;
}

export default function ValidationTemplatesAdmin() {
  const [state, setState] = useState<TemplateAdminState>({
    templates: [],
    selectedTemplate: null,
    isEditing: false,
    isCreating: false,
    loading: true,
    error: null
  });

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/validation/templates?includeMetrics=true');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load templates');
      }
      
      setState(prev => ({
        ...prev,
        templates: result.data,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      }));
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: Partial<ValidationTemplate> = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      version: '1.0.0',
      personaType: PersonaType.STANDARD,
      rules: [],
      fallbackStrategy: {
        type: 'regenerate' as any,
        maxRetries: 3
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        author: 'Admin',
        description: 'New validation template',
        tags: [],
        isActive: false
      }
    };

    setState(prev => ({
      ...prev,
      selectedTemplate: newTemplate as ValidationTemplate,
      isCreating: true,
      isEditing: true
    }));
  };

  const handleSelectTemplate = (template: ValidationTemplate) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template,
      isEditing: false,
      isCreating: false
    }));
  };

  const handleEditTemplate = () => {
    setState(prev => ({ ...prev, isEditing: true }));
  };

  const handleSaveTemplate = async (template: ValidationTemplate) => {
    try {
      const url = state.isCreating 
        ? '/api/validation/templates'
        : `/api/validation/templates/${template.id}`;
      
      const method = state.isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(template)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save template');
      }

      // Reload templates and update state
      await loadTemplates();
      
      setState(prev => ({
        ...prev,
        selectedTemplate: result.data,
        isEditing: false,
        isCreating: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save template'
      }));
    }
  };

  const handleCancelEdit = () => {
    setState(prev => ({
      ...prev,
      isEditing: false,
      isCreating: false,
      selectedTemplate: prev.isCreating ? null : prev.selectedTemplate
    }));
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/validation/templates/${templateId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete template');
      }

      // Reload templates and clear selection if deleted template was selected
      await loadTemplates();
      
      if (state.selectedTemplate?.id === templateId) {
        setState(prev => ({ ...prev, selectedTemplate: null }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete template'
      }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Validation Template Administration
        </h1>
        <p className="text-gray-600">
          Manage validation templates for LLM response validation
        </p>
      </div>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800">{state.error}</div>
          <button
            onClick={() => setState(prev => ({ ...prev, error: null }))}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Templates</h2>
                <button
                  onClick={handleCreateTemplate}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Create New
                </button>
              </div>
            </div>
            <TemplateList
              templates={state.templates}
              selectedTemplate={state.selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </div>
        </div>

        {/* Template Editor/Preview */}
        <div className="lg:col-span-2">
          {state.selectedTemplate ? (
            <div className="space-y-6">
              {/* Template Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {state.isEditing ? 'Edit Template' : 'Template Details'}
                  </h2>
                  <div className="space-x-2">
                    {!state.isEditing && (
                      <button
                        onClick={handleEditTemplate}
                        className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                      >
                        Edit
                      </button>
                    )}
                    {state.isEditing && (
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Template Editor or Preview */}
              {state.isEditing ? (
                <TemplateEditor
                  template={state.selectedTemplate}
                  onSave={handleSaveTemplate}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <TemplatePreview template={state.selectedTemplate} />
              )}

              {/* Template Validator */}
              <TemplateValidator template={state.selectedTemplate} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Template Selected
              </h3>
              <p className="text-gray-500 mb-4">
                Select a template from the list to view or edit its details
              </p>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create New Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}