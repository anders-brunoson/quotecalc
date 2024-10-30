import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SearchableRoleSelect = ({ roles, value, onChange, commitment = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = useCallback((role) => {
    onChange(role.name);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  }, [onChange]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prevIndex) => 
          (prevIndex < filteredRoles.length - 1) ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredRoles.length) {
          handleSelect(filteredRoles[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  }, [isOpen, filteredRoles, highlightedIndex, handleSelect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  return (
    <div className="relative w-full" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <div className="relative group">
        <div 
          className="absolute inset-0 bg-gray-100 transition-all duration-200 rounded-md"
          style={{ width: `${commitment}%` }}
        />
        <Button
          type="button"
          onClick={toggleDropdown}
          className="relative w-full justify-between bg-transparent hover:bg-transparent border border-gray-300 hover:border-gray-900 transition-colors duration-200 text-black"
        >
          {value || 'Select a role'}
          {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <Input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2"
            ref={searchInputRef}
          />
          <ul className="max-h-60 overflow-auto" ref={listRef}>
            {filteredRoles.map((role, index) => (
              <li
                key={`${role.name}-${role.code}`}
                onClick={() => handleSelect(role)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-2 cursor-pointer text-left ${
                  index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                {role.name} ({role.code})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableRoleSelect;