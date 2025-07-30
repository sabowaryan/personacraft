import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ValidationMetadata, ValidationDetail } from '@/types/enhanced-persona';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ValidationSectionProps {
  validationData?: ValidationMetadata;
  showDetails?: boolean;
  className?: string;
}

interface ValidationScoreDisplayProps {
  score: number;
  status: 'passed' | 'failed' | 'warning';
  className?: string;
}

const ValidationScoreDisplay: React.FC<ValidationScoreDisplayProps> = ({
  score,
  status,
  className
}) => {
  const getScoreConfig = (score: number, status: string) => {
    if (status === 'failed' || score < 50) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '❌',
        level: 'Poor'
      };
    } else if (score < 70) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '⚠️',
        level: 'Fair'
      };
    } else if (score < 85) {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: '✅',
        level: 'Good'
      };
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '🎯',
        level: 'Excellent'
      };
    }
  };

  const config = getScoreConfig(score, status);

  return (
    <div className={cn(
      'rounded-xl p-6 border-2',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">Validation Score</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="status">
            {config.icon}
          </span>
          <div className={cn('text-3xl font-bold', config.color)}>
            {score}%
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={cn('text-lg font-semibold', config.color)}>
          {config.level}
        </span>
        <Badge 
          className={cn(
            'text-xs font-medium',
            config.color,
            config.bgColor,
            'border',
            config.borderColor
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
    </div>
  );
};

interface ValidationRuleItemProps {
  rule: ValidationDetail;
  index: number;
}

const ValidationRuleItem: React.FC<ValidationRuleItemProps> = ({ rule, index }) => {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'format':
        return '📝';
      case 'content':
        return '📄';
      case 'cultural':
        return '🌍';
      case 'demographic':
        return '👥';
      default:
        return '📋';
    }
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      rule.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label={rule.category}>
            {getCategoryIcon(rule.category)}
          </span>
          <span className="font-medium text-slate-900">
            {rule.rule}
          </span>
          <Badge 
            className={cn(
              'text-xs',
              rule.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            )}
          >
            {rule.passed ? 'Passed' : 'Failed'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {rule.severity && (
            <Badge className={cn('text-xs', getSeverityColor(rule.severity))}>
              {rule.severity.toUpperCase()}
            </Badge>
          )}
          <span className={cn(
            'text-sm font-semibold',
            rule.passed ? 'text-green-600' : 'text-red-600'
          )}>
            {rule.score}%
          </span>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-2">
        {rule.message}
      </p>
      
      {rule.field && (
        <div className="text-xs text-slate-500">
          Field: <span className="font-mono">{rule.field}</span>
        </div>
      )}
      
      {(rule.expectedValue || rule.actualValue) && (
        <div className="mt-2 p-2 bg-slate-100 rounded text-xs">
          {rule.expectedValue && (
            <div>
              <span className="font-semibold">Expected:</span> {JSON.stringify(rule.expectedValue)}
            </div>
          )}
          {rule.actualValue && (
            <div>
              <span className="font-semibold">Actual:</span> {JSON.stringify(rule.actualValue)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CategoryScoresProps {
  categoryScores: {
    format: number;
    content: number;
    cultural: number;
    demographic: number;
  };
}

const CategoryScores: React.FC<CategoryScoresProps> = ({ categoryScores }) => {
  const categories = [
    { key: 'format', label: 'Format', icon: '📝' },
    { key: 'content', label: 'Content', icon: '📄' },
    { key: 'cultural', label: 'Cultural', icon: '🌍' },
    { key: 'demographic', label: 'Demographics', icon: '👥' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map(({ key, label, icon }) => {
        const score = categoryScores[key as keyof typeof categoryScores];
        return (
          <div key={key} className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl mb-1" role="img" aria-label={label}>
              {icon}
            </div>
            <div className="text-xs text-slate-600 mb-1">{label}</div>
            <div className={cn('text-lg font-bold', getScoreColor(score))}>
              {score}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ValidationSection: React.FC<ValidationSectionProps> = ({
  validationData,
  showDetails = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  if (!validationData) {
    return (
      <Card className={cn('bg-gray-50', className)}>
        <CardHeader>
          <CardTitle className="text-gray-600">No Validation Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            This persona doesn't have validation metadata. Consider re-generating with the new validation system.
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    validationScore,
    overallStatus,
    templateName,
    validationDetails,
    passedRules,
    failedRules,
    categoryScores,
    validationTime,
    validatedAt
  } = validationData;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Validation Results</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Details
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main validation score display */}
        <ValidationScoreDisplay
          score={validationScore}
          status={overallStatus}
        />

        {/* Summary statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {passedRules.length}
            </div>
            <div className="text-sm text-green-700">Passed Rules</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {failedRules.length}
            </div>
            <div className="text-sm text-red-700">Failed Rules</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {validationTime}ms
            </div>
            <div className="text-sm text-blue-700">Processing Time</div>
          </div>
        </div>

        {/* Category scores */}
        {categoryScores && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Category Breakdown</h4>
            <CategoryScores categoryScores={categoryScores} />
          </div>
        )}

        {/* Template information */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">Template Used</div>
              <div className="font-medium text-slate-900">{templateName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Validated At</div>
              <div className="font-medium text-slate-900">
                {new Date(validatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed validation rules */}
        {isExpanded && validationDetails.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">
              Detailed Rule Results ({validationDetails.length} rules)
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {validationDetails.map((rule, index) => (
                <ValidationRuleItem
                  key={`${rule.rule}-${index}`}
                  rule={rule}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationSection;