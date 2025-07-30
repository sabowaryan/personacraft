import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GenerationMetadata, ValidationMetadata } from '@/types/enhanced-persona';
import {
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  BarChart3,
  TrendingUp,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

interface MetadataBadgeProps {
  metadata?: GenerationMetadata;
  validationData?: ValidationMetadata;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'detailed';
  showTooltip?: boolean;
  className?: string;
}

interface BadgeConfig {
  bg: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const badgeConfigs: Record<string, BadgeConfig> = {
  'qloo-first': {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
    text: 'text-white',
    icon: Target,
    label: 'Qloo First',
    description: 'Generated using Qloo First system with enhanced cultural data'
  },
  'legacy-fallback': {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    text: 'text-white',
    icon: Zap,
    label: 'Legacy',
    description: 'Generated using legacy fallback system'
  },
  'high-validation': {
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    text: 'text-white',
    icon: CheckCircle,
    label: 'Validated',
    description: 'High validation score (80%+)'
  },
  'medium-validation': {
    bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
    text: 'text-white',
    icon: AlertTriangle,
    label: 'Partial',
    description: 'Medium validation score (50-79%)'
  },
  'low-validation': {
    bg: 'bg-gradient-to-r from-red-500 to-rose-600',
    text: 'text-white',
    icon: XCircle,
    label: 'Needs Review',
    description: 'Low validation score (<50%)'
  }
};

const getValidationBadgeType = (score: number): string => {
  if (score >= 80) return 'high-validation';
  if (score >= 50) return 'medium-validation';
  return 'low-validation';
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs';
    case 'lg':
      return 'px-4 py-1.5 text-sm';
    default:
      return 'px-3 py-1 text-xs';
  }
};

export const MetadataBadge: React.FC<MetadataBadgeProps> = ({
  metadata,
  validationData,
  size = 'md',
  variant = 'compact',
  showTooltip = true,
  className
}) => {
  const badges: Array<{ type: string; config: BadgeConfig; additionalInfo?: string }> = [];

  // Add generation source badge with enhanced information
  if (metadata?.source) {
    const config = badgeConfigs[metadata.source];
    if (config) {
      let additionalInfo = '';
      if (metadata.source === 'qloo-first' && metadata.qlooDataUsed) {
        additionalInfo = 'Données Qloo utilisées';
      } else if (metadata.source === 'legacy-fallback' && metadata.fallbackReason) {
        additionalInfo = `Fallback: ${metadata.fallbackReason}`;
      }
      badges.push({ type: metadata.source, config, additionalInfo });
    }
  }

  // Add validation score badge with enhanced information
  if (validationData?.validationScore !== undefined) {
    const validationType = getValidationBadgeType(validationData.validationScore);
    const config = badgeConfigs[validationType];
    if (config) {
      const additionalInfo = `${validationData.passedRules.length}/${validationData.passedRules.length + validationData.failedRules.length} règles respectées`;
      badges.push({ type: validationType, config, additionalInfo });
    }
  }

  // Add template badge if available
  if (metadata?.templateUsed && variant === 'detailed') {
    const templateConfig: BadgeConfig = {
      bg: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      text: 'text-white',
      icon: FileText,
      label: 'Template',
      description: `Template utilisé: ${metadata.templateUsed}`
    };
    badges.push({ type: 'template', config: templateConfig, additionalInfo: metadata.templateUsed });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {badges.map(({ type, config, additionalInfo }, index) => {
        // Smart tooltip positioning to prevent overflow
        const isFirst = index === 0;
        const isLast = index === badges.length - 1;

        // Special handling for validation badges to ensure they align right
        const isValidationBadge = type.includes('validation');
        const isValidatedBadge = config.label === 'Validated' || config.label === 'Partial' || config.label === 'Needs Review';

        // Position tooltips based on their position in the badge array
        let tooltipPositionClass = "";
        let arrowPositionClass = "";

        if (badges.length === 1) {
          // Single badge: center the tooltip
          tooltipPositionClass = "left-1/2 transform -translate-x-1/2";
          arrowPositionClass = "left-1/2 transform -translate-x-1/2";
        } else if (isValidationBadge || isValidatedBadge) {
          // Validation badges: always align tooltip to the right
          tooltipPositionClass = "right-0";
          arrowPositionClass = "right-4";
        } else if (isFirst) {
          // First badge (non-validation): align tooltip to the left to prevent left overflow
          tooltipPositionClass = "left-0";
          arrowPositionClass = "left-4";
        } else if (isLast) {
          // Last badge: align tooltip to the right to prevent right overflow
          tooltipPositionClass = "right-0";
          arrowPositionClass = "right-4";
        } else {
          // Middle badges: center the tooltip
          tooltipPositionClass = "left-1/2 transform -translate-x-1/2";
          arrowPositionClass = "left-1/2 transform -translate-x-1/2";
        }

        return (
          <div key={`${type}-${index}`} className="relative group/badge">
            <Badge
              className={cn(
                config.bg,
                config.text,
                'border-0 font-medium shadow-sm',
                getSizeClasses(size),
                'hover:opacity-90 hover:scale-105 transition-all duration-200'
              )}
            >
              <config.icon className="mr-1 h-3 w-3" />
              {variant === 'detailed' ? config.label : (size === 'sm' ? null : config.label)}
            </Badge>

            {showTooltip && (
              <div className={cn(
                "absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/badge:opacity-100 transition-opacity duration-200 pointer-events-none z-30",
                "w-48 sm:w-56 md:w-64 max-w-[85vw]",
                tooltipPositionClass
              )}>
                <div className="font-semibold truncate">{config.label}</div>
                <div className="text-gray-300 mb-1 text-wrap break-words leading-relaxed text-left">
                  {config.description}
                </div>
                {additionalInfo && (
                  <div className="text-gray-200 text-xs border-t border-gray-700 pt-1 mt-1 text-wrap break-words text-left">
                    {additionalInfo}
                  </div>
                )}
                {/* Enhanced tooltip arrow with dynamic positioning */}
                <div className={cn(
                  "absolute top-full border-4 border-transparent border-t-gray-900",
                  arrowPositionClass
                )}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Enhanced quality indicator component for cultural data richness and validation
interface QualityIndicatorProps {
  culturalRichness?: 'low' | 'medium' | 'high';
  validationScore?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcons?: boolean;
}

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({
  culturalRichness,
  validationScore,
  size = 'md',
  className,
  showIcons = true
}) => {
  const indicators: Array<{
    label: string;
    value: string;
    color: string;
    bgColor: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [];

  // Enhanced cultural richness indicator
  if (culturalRichness) {
    const richnessConfig = {
      low: {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: BarChart3,
        label: 'Données limitées',
        description: 'Peu de données culturelles disponibles'
      },
      medium: {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        icon: TrendingUp,
        label: 'Données moyennes',
        description: 'Données culturelles partielles'
      },
      high: {
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: Target,
        label: 'Données riches',
        description: 'Données culturelles complètes et détaillées'
      }
    };

    const config = richnessConfig[culturalRichness];
    indicators.push({
      label: 'Données culturelles',
      value: config.label,
      color: config.color,
      bgColor: config.bgColor,
      icon: config.icon,
      description: config.description
    });
  }

  // Enhanced validation score indicator
  if (validationScore !== undefined) {
    const getValidationConfig = (score: number) => {
      if (score >= 90) return {
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: CheckSquare,
        label: 'Excellent',
        description: 'Validation excellente (90%+)'
      };
      if (score >= 75) return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: CheckCircle,
        label: 'Bon',
        description: 'Bonne validation (75-89%)'
      };
      if (score >= 50) return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        icon: AlertCircle,
        label: 'Moyen',
        description: 'Validation moyenne (50-74%)'
      };
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: XCircle,
        label: 'Faible',
        description: 'Validation faible (<50%)'
      };
    };

    const config = getValidationConfig(validationScore);
    indicators.push({
      label: 'Validation',
      value: `${validationScore}% (${config.label})`,
      color: config.color,
      bgColor: config.bgColor,
      icon: config.icon,
      description: config.description
    });
  }

  if (indicators.length === 0) {
    return null;
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-1';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {indicators.map((indicator, index) => {
        // Smart tooltip positioning to prevent overflow
        const isFirst = index === 0;
        const isLast = index === indicators.length - 1;

        // Position tooltips based on their position in the indicator array
        let tooltipPositionClass = "";
        let arrowPositionClass = "";

        if (indicators.length === 1) {
          // Single indicator: center the tooltip
          tooltipPositionClass = "left-1/2 transform -translate-x-1/2";
          arrowPositionClass = "left-1/2 transform -translate-x-1/2";
        } else if (isFirst) {
          // First indicator: align tooltip to the left to prevent left overflow
          tooltipPositionClass = "left-0";
          arrowPositionClass = "left-4";
        } else if (isLast) {
          // Last indicator: align tooltip to the right to prevent right overflow
          tooltipPositionClass = "right-0";
          arrowPositionClass = "right-4";
        } else {
          // Middle indicators: center the tooltip
          tooltipPositionClass = "left-1/2 transform -translate-x-1/2";
          arrowPositionClass = "left-1/2 transform -translate-x-1/2";
        }

        return (
          <div key={index} className="relative group/indicator">
            <div className={cn(
              'flex items-center gap-1.5 rounded-lg border transition-all duration-200 hover:shadow-sm',
              indicator.bgColor,
              sizeClasses
            )}>
              {showIcons && (
                <indicator.icon className="h-3 w-3" />
              )}
              <span className="text-gray-600 font-medium">{indicator.label}:</span>
              <span className={cn('font-semibold', indicator.color)}>
                {size === 'sm' ? indicator.value.split(' ')[0] : indicator.value}
              </span>
            </div>

            {/* Enhanced responsive tooltip */}
            <div className={cn(
              "absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/indicator:opacity-100 transition-opacity duration-200 pointer-events-none z-30",
              "w-40 sm:w-48 md:w-56 max-w-[80vw]",
              tooltipPositionClass
            )}>
              <div className="font-semibold truncate">{indicator.label}</div>
              <div className="text-gray-300 text-wrap break-words leading-relaxed text-left">
                {indicator.description}
              </div>
              {/* Enhanced tooltip arrow with dynamic positioning */}
              <div className={cn(
                "absolute top-full border-4 border-transparent border-t-gray-900",
                arrowPositionClass
              )}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetadataBadge;