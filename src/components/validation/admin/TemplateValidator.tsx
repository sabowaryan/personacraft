/**
 * TemplateValidator Component
 * Tool for testing and validating templates with sample data
 */

import React, { useState } from 'react';
import { ValidationTemplate, ValidationResult, PersonaType } from '@/types/validation';

interface TemplateValidatorProps {
  template: ValidationTemplate;
}

interface TestResult {
  success: boolean;
  result?: ValidationResult;
  error?: string;
  timestamp: number;
  testData: any;
}

export function TemplateValidator({ template }: TemplateValidatorProps) {
  const [testData, setTestData] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>('');

  // Sample test data for different persona types
  const sampleData = {
    simple: {
      name: 'Simple Persona Sample',
      data: JSON.stringify({
        id: 'persona-123',
        name: 'Sarah Johnson',
        age: 28,
        occupation: 'Marketing Manager',
        location: 'New York, NY',
        interests: ['technology', 'travel', 'fitness']
      }, null, 2)
    },
    standard: {
      name: 'Standard Persona Sample',
      data: JSON.stringify({
        id: 'persona-456',
        name: 'Michael Chen',
        age: 34,
        occupation: 'Software Engineer',
        location: 'San Francisco, CA',
        demographics: {
          age: 34,
          gender: 'male',
          income: 120000,
          education: 'Bachelor\'s Degree'
        },
        psychographics: {
          personality: ['analytical', 'innovative'],
          values: ['efficiency', 'quality'],
          lifestyle: 'tech-savvy professional'
        },
        culturalData: {
          language: 'English',
          region: 'North America',
          culturalValues: ['individualism', 'achievement']
        }
      }, null, 2)
    },
    b2b: {
      name: 'B2B Persona Sample',
      data: JSON.stringify({
        id: 'persona-789',
        name: 'Jennifer Rodriguez',
        age: 42,
        occupation: 'VP of Operations',
        company: 'TechCorp Inc.',
        industry: 'Technology',
        companySize: '500-1000',
        role: 'decision-maker',
        painPoints: [
          'Inefficient processes',
          'High operational costs',
          'Lack of automation'
        ],
        goals: [
          'Streamline operations',
          'Reduce costs by 20%',
          'Improve team productivity'
        ],
        demographics: {
          age: 42,
          gender: 'female',
          income: 180000,
          education: 'MBA'
        }
      }, null, 2)
    }
  };

  const handleLoadSample = (sampleKey: string) => {
    const sample = sampleData[sampleKey as keyof typeof sampleData];
    if (sample) {
      setTestData(sample.data);
      setSelectedSample(sampleKey);
    }
  };

  const handleValidateTemplate = async () => {
    if (!testData.trim()) {
      return;
    }

    setIsValidating(true);

    try {
      // Parse test data
      const parsedData = JSON.parse(testData);

      // Call validation API
      const response = await fetch('/api/validation/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: template.id,
          testData: parsedData
        })
      });

      const result = await response.json();

      const testResult: TestResult = {
        success: result.success,
        result: result.success ? result.data : undefined,
        error: result.success ? undefined : result.error,
        timestamp: Date.now(),
        testData: parsedData
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      const testResult: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        testData: testData
      };

      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
    } finally {
      setIsValidating(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(testData);
      setTestData(JSON.stringify(parsed, null, 2));
    } catch (error) {
      // Invalid JSON, do nothing
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Template Validator</h3>
          <p className="text-sm text-gray-600">
            Test your validation template with sample data to ensure it works correctly.
          </p>
        </div>

        {/* Sample Data Loader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load Sample Data
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sampleData).map(([key, sample]) => (
              <button
                key={key}
                onClick={() => handleLoadSample(key)}
                className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                  selectedSample === key
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Test Data Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Test Data (JSON)
            </label>
            <button
              onClick={formatJson}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Format JSON
            </button>
          </div>
          <textarea
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter JSON data to validate..."
          />
        </div>

        {/* Validation Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Template: {template.name} (v{template.version})
          </div>
          <div className="space-x-2">
            {testResults.length > 0 && (
              <button
                onClick={clearResults}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
              >
                Clear Results
              </button>
            )}
            <button
              onClick={handleValidateTemplate}
              disabled={isValidating || !testData.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Test Results</h4>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={result.timestamp}
                  className={`border rounded-lg p-4 ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        result.success ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium">
                        Test #{testResults.length - index}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Valid' : 'Invalid'}
                    </span>
                  </div>

                  {result.success && result.result ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Score:</span>
                          <span className="ml-1 font-medium">{(result.result.score * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Errors:</span>
                          <span className="ml-1 font-medium text-red-600">{result.result.errors.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Warnings:</span>
                          <span className="ml-1 font-medium text-yellow-600">{result.result.warnings.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-1 font-medium">{result.result.metadata.validationTime}ms</span>
                        </div>
                      </div>

                      {result.result.errors.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-800 mb-2">Errors:</h5>
                          <div className="space-y-1">
                            {result.result.errors.map((error, errorIndex) => (
                              <div key={errorIndex} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                                <span className="font-medium">{error.field}:</span> {error.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.result.warnings.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h5>
                          <div className="space-y-1">
                            {result.result.warnings.map((warning, warningIndex) => (
                              <div key={warningIndex} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                                <span className="font-medium">{warning.field}:</span> {warning.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      <span className="font-medium">Error:</span> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}