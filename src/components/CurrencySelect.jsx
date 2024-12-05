import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const commonCurrencies = [
  { symbol: "SEK", label: "SEK - Swedish Krona" },
  { symbol: "€", label: "EUR - Euro" },
  { symbol: "DKK", label: "DKK - Danish Krone" },
  // Rest in alphabetical order
  { symbol: "AUD", label: "AUD - Australian Dollar" },
  { symbol: "CAD", label: "CAD - Canadian Dollar" },
  { symbol: "CHF", label: "CHF - Swiss Franc" },
  { symbol: "CNY", label: "CNY - Chinese Yuan Renminbi" },
  { symbol: "£", label: "GBP - British Pound" },
  { symbol: "HKD", label: "HKD - Hong Kong Dollar" },
  { symbol: "INR", label: "INR - Indian Rupee" },
  { symbol: "¥", label: "JPY - Japanese Yen" },
  { symbol: "KRW", label: "KRW - South Korean Won" },
  { symbol: "NOK", label: "NOK - Norwegian Krone" },
  { symbol: "SGD", label: "SGD - Singapore Dollar" },
  { symbol: "TRY", label: "TRY - Turkish Lira" },
  { symbol: "$", label: "USD - US Dollar" },
];

const CurrencySelect = ({ 
  value, 
  onChange,
  onConvertCurrency
}) => {
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [newCurrencyValue, setNewCurrencyValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversionRate, setConversionRate] = useState(null);

  const handleCurrencyChange = async (newValue) => {
    if (value === newValue) return;

    setNewCurrencyValue(newValue);
    setShowConversionDialog(true);
  };

  const fetchExchangeRate = async (from, to) => {
    try {
      setIsLoading(true);
      console.log(`Fetching exchange rate from ${from} to ${to}`);
      
      // Handle special symbols
      const fromCurrency = from === '€' ? 'EUR' : 
                         from === '$' ? 'USD' : 
                         from === '£' ? 'GBP' : 
                         from === '¥' ? 'JPY' : from;
      
      const toCurrency = to === '€' ? 'EUR' : 
                       to === '$' ? 'USD' : 
                       to === '£' ? 'GBP' : 
                       to === '¥' ? 'JPY' : to;
      
      const url = `https://api.frankfurter.app/latest?amount=1&from=${fromCurrency}&to=${toCurrency}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received data:', data);
      
      if (!data.rates || !data.rates[toCurrency]) {
        throw new Error('Invalid response format or missing rate');
      }
      
      setConversionRate(data.rates[toCurrency]);
      return data.rates[toCurrency];
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setConversionRate('error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversionConfirm = async (shouldConvert) => {
    if (shouldConvert) {
      const fromCurrency = value === '€' ? 'EUR' : 
                          value === '$' ? 'USD' : 
                          value === '£' ? 'GBP' : 
                          value === '¥' ? 'JPY' : value;
      
      const toCurrency = newCurrencyValue === '€' ? 'EUR' : 
                        newCurrencyValue === '$' ? 'USD' : 
                        newCurrencyValue === '£' ? 'GBP' : 
                        newCurrencyValue === '¥' ? 'JPY' : newCurrencyValue;

      const rate = await fetchExchangeRate(fromCurrency, toCurrency);
      if (rate) {
        onConvertCurrency(rate);
      }
    }
    
    onChange(newCurrencyValue);
    setShowConversionDialog(false);
    setNewCurrencyValue('');
    setConversionRate(null);
  };

  return (
    <>
      <Select value={value} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {commonCurrencies.map(({ symbol, label }) => (
            <SelectItem key={symbol} value={symbol}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showConversionDialog} onOpenChange={setShowConversionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Currency Conversion</DialogTitle>
            <DialogDescription>
              Would you like to convert all amounts from {value} to {newCurrencyValue}?
              {isLoading && (
                <div className="flex items-center mt-2 text-blue-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching latest exchange rate...
                </div>
              )}
              {conversionRate === 'error' ? (
                <div className="mt-2 text-red-600">
                  Failed to fetch exchange rate. Please try again or just change the currency symbol.
                </div>
              ) : conversionRate && (
                <div className="mt-2">
                  Current rate: 1 {value} = {conversionRate.toFixed(4)} {newCurrencyValue}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleConversionConfirm(false)}
            >
              Just Change Symbol
            </Button>
            <Button 
              onClick={() => handleConversionConfirm(true)}
              disabled={isLoading || conversionRate === 'error'}
            >
              Convert All Amounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CurrencySelect;