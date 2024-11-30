import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const commonCurrencies = [
  { symbol: "SEK", label: "SEK - Swedish Krona" },
  { symbol: "€", label: "EUR - Euro" },
  { symbol: "DKK", label: "DKK - Danish Krone" },
  { symbol: "NOK", label: "NOK - Norwegian Krone" },
  { symbol: "$", label: "USD - US Dollar" },
  { symbol: "£", label: "GBP - British Pound" },
  { symbol: "¥", label: "JPY - Japanese Yen" },
];

const CurrencySelect = ({ value, onChange, customCurrency, onCustomCurrencyChange }) => {
  const [showCustom, setShowCustom] = React.useState(
    !commonCurrencies.some(c => c.symbol === value)
  );
  return (
    <div className="flex items-center space-x-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {commonCurrencies.map(({ symbol, label }) => (
            <SelectItem key={symbol} value={symbol}>
              {label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>
      
      {(showCustom || value === 'custom') && (
        <Input
          type="text"
          value={customCurrency}
          onChange={(e) => {
            onCustomCurrencyChange(e.target.value);
            onChange('custom');
          }}
          className="w-20"
          placeholder="e.g. CHF"
          maxLength={4}
        />
      )}
    </div>
  );
};

export default CurrencySelect;