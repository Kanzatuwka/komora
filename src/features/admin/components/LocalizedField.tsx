import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, Language } from '@/i18n/config';

interface LocalizedFieldProps {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  type?: 'text' | 'textarea';
  required?: boolean;
}

export function LocalizedField({ label, value, onChange, type = 'text', required = false }: LocalizedFieldProps) {
  const [activeTab, setActiveTab] = useState<Language>('uk');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...value, [activeTab]: e.target.value });
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-1 mb-2 border-b border-gray-200">
        {SUPPORTED_LANGUAGES.map((lng) => {
          const filled = value?.[lng]?.trim().length > 0;
          return (
            <button
              key={lng}
              type="button"
              onClick={() => setActiveTab(lng)}
              className={`px-3 py-1 text-sm uppercase transition-all ${
                activeTab === lng 
                  ? 'border-b-2 border-farm-green font-bold text-farm-green' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {lng} {filled ? '●' : '○'}
            </button>
          );
        })}
      </div>

      {type === 'textarea' ? (
        <textarea
          value={value?.[activeTab] || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-farm-green focus:border-farm-green outline-none min-h-[100px]"
        />
      ) : (
        <input
          type="text"
          value={value?.[activeTab] || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-farm-green focus:border-farm-green outline-none"
        />
      )}
    </div>
  );
}
