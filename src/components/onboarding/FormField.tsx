'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  description?: string;
}

export default function FormField({ label, required = false, children, description }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {children}
    </div>
  );
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
}

export function SelectField({ value, onChange, options, placeholder, required }: SelectFieldProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
}

export function InputField({ value, onChange, placeholder, required, type = "text" }: InputFieldProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
      placeholder={placeholder}
      required={required}
    />
  );
}