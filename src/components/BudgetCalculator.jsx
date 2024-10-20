import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, GripVertical, Moon, Sun, Info, Download, Upload, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CSVUpload from './CSVUpload';
import RateCardCSVUpload from './RateCardCSVUpload';
import { exportStateToJSON, importStateFromJSON } from './jsonUtils';
import SearchableRoleSelect from './SearchableRoleSelect';
import RateCardModal from './RateCardModal';

const VERSION = "0.9.1";

const formatCurrency = (value) => Math.round(value).toLocaleString();

const QuoteCalculator = () => {
  const [simulationName, setSimulationName] = useState('');
  const [simulationDescription, setSimulationDescription] = useState('');
  const [chunks, setChunks] = useState(['Dummy chunk 1 (remove, then add your own)','Dummy chunk 2']);
  const [commitments, setCommitments] = useState({});
  const [rateCardName, setRateCardName] = useState('');  
  const [isRateCardModalOpen, setIsRateCardModalOpen] = useState(false);  
  const [hourlyRates, setHourlyRates] = useState({});
  const [hourlyCosts, setHourlyCosts] = useState({});
  const [workingDays, setWorkingDays] = useState({});
  const [workingHours, setWorkingHours] = useState({});
  const [budget, setBudget] = useState({});
  const [chunkTemplate, setChunkTemplate] = useState('custom');
  const [isAddingChunk, setIsAddingChunk] = useState(false);
  const [newChunkName, setNewChunkName] = useState('');
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [editingChunk, setEditingChunk] = useState(null);
  const editInputRef = useRef(null);
  const [chunkOrder, setChunkOrder] = React.useState([]);
  const [selectorKey, setSelectorKey] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [version, setVersion] = useState(VERSION);

  const [roles, setRoles] = useState([
    { id: '1', name: 'Dummy role (remove, then add your lineup)', code: '303', alias: '' },
  ]);

  const [predefinedRoles, setPredefinedRoles] = useState([
    { name: 'Systems Developer BE', hourlyRate: 1200, hourlyCost: 800, code: '302' },
    { name: 'Systems Developer FE', hourlyRate: 1100, hourlyCost: 750, code: '302' },
    { name: 'UX Designer', hourlyRate: 1000, hourlyCost: 700, code: '200' },
    { name: 'Digital Designer', hourlyRate: 950, hourlyCost: 650, code: '200' },
    { name: 'Project Manager', hourlyRate: 1300, hourlyCost: 900, code: '030' },
    { name: 'DevOps Engineer', hourlyRate: 1250, hourlyCost: 850, code: '400' },
    { name: 'Data Scientist', hourlyRate: 1400, hourlyCost: 950, code: '306' },
    { name: 'QA Engineer', hourlyRate: 1000, hourlyCost: 700, code: '303' },
  ]);

  const handleExportJSON = () => {
    const stateToExport = {
      version,
      simulationName,
      simulationDescription,
      chunks,
      roles,
      commitments,
      hourlyRates,
      hourlyCosts,
      workingDays,
      workingHours,
      rateCardName,
      predefinedRoles,
      chunkOrder,
      discount
    };
    const jsonData = exportStateToJSON(stateToExport);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Use simulationName for the file name, or a default if it's empty
    const fileName = simulationName.trim() 
      ? `${simulationName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}_quote_simulator.json`
      : 'quote_simulator_state.json';
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedState = importStateFromJSON(e.target.result);
          
          setVersion(importedState.version || VERSION);
          setSimulationName(importedState.simulationName || '');
          setSimulationDescription(importedState.simulationDescription || '');
          setChunks(importedState.chunks);
          setRoles(importedState.roles);
          setCommitments(importedState.commitments);
          setHourlyRates(importedState.hourlyRates);
          setHourlyCosts(importedState.hourlyCosts);
          setWorkingDays(importedState.workingDays);
          setWorkingHours(importedState.workingHours);
          setRateCardName(importedState.rateCardName);
          setPredefinedRoles(importedState.predefinedRoles);
          setChunkOrder(importedState.chunkOrder);
          setDiscount(importedState.discount);
          setActiveTab(importedState.chunks[0]);
          setSelectedChunks([]);
          setSelectorKey(prevKey => prevKey + 1);
        } catch (error) {
          console.error('Error importing JSON:', error);
          // You might want to show an error message to the user here
        }
      };
      reader.readAsText(file);
    }
  };

  const sortedPredefinedRoles = React.useMemo(() => {
    return [...predefinedRoles].sort((a, b) => a.name.localeCompare(b.name));
  }, [predefinedRoles]);

  useEffect(() => {
    console.log("QuoteCalculator component loaded");
  }, []);

  const handleRateCardUploaded = (data) => {
    console.log("Rate card uploaded, received data:", data);
    
    if (!data || !data.roles || !Array.isArray(data.roles)) {
      console.error("Invalid rate card data:", data);
      return;
    }

    setRateCardName(data.rateCardName);
    
    const newPredefinedRoles = data.roles.map(role => {
      console.log("Processing role:", role);
      return {
        name: role.RoleName,
        hourlyRate: parseInt(role.HourlyRate),
        hourlyCost: parseInt(role.HourlyCost),
        code: role.RoleCode
      };
    });

    console.log("Setting new predefined roles:", newPredefinedRoles);
    setPredefinedRoles(newPredefinedRoles);
    setSelectorKey(prevKey => prevKey + 1);

    // Update existing roles with new rates and costs if they match
    setRoles(prevRoles => {
      const updatedRoles = prevRoles.map(role => {
        const matchingNewRole = newPredefinedRoles.find(newRole => newRole.name === role.name);
        if (matchingNewRole) {
          console.log(`Updating existing role: ${role.name}`);
          setHourlyRates(prev => ({ ...prev, [role.id]: matchingNewRole.hourlyRate }));
          setHourlyCosts(prev => ({ ...prev, [role.id]: matchingNewRole.hourlyCost }));
          return { ...role, code: matchingNewRole.code };
        }
        return role;
      });
      console.log("Updated roles:", updatedRoles);
      return updatedRoles;
    });

    // Open the rate card modal after uploading
    setIsRateCardModalOpen(true);
  };

  useEffect(() => {
    console.log("predefinedRoles updated:", predefinedRoles);
  }, [predefinedRoles]);

  const handleDataUploaded = (data) => {
    setChunks(data.chunks);
    setRoles(data.roles);
    setCommitments(data.commitments);
    setHourlyRates(data.hourlyRates);
    setWorkingHours(data.workingHours);
    setWorkingDays(data.workingDays);
    setChunkOrder(data.chunks);
    setActiveTab(data.chunks[0]);
    setSelectedChunks([]);
  };  

  useEffect(() => {
    initializeState();
  }, []);

  useEffect(() => {
    if (chunks.length > 0 && !chunks.includes(activeTab)) {
      setActiveTab(chunks[0]);
    }
  }, [chunks, activeTab]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const initializeState = () => {
    const initialCommitments = {};
    const initialHourlyRates = {};
    const initialWorkingDays = {};
    const initialWorkingHours = {};

    roles.forEach(role => {
      initialCommitments[role.id] = {};
      initialHourlyRates[role.id] = 1000;
      initialWorkingHours[role.id] = 8;  // Set default working hours to 8
      chunks.forEach(chunk => {
        initialCommitments[role.id][chunk] = 50;
        initialWorkingDays[chunk] = 21;
      });
    });

    setCommitments(initialCommitments);
    setHourlyRates(initialHourlyRates);
    setWorkingDays(initialWorkingDays);
    setWorkingHours(initialWorkingHours);  // Set the initial working hours
    setActiveTab(chunks[0]);
    setChunkOrder(chunks);
    
    const initialHourlyCosts = {};
    roles.forEach(role => {
      initialHourlyCosts[role.id] = 700; // Set default hourly cost to 700
    });
    setHourlyCosts(initialHourlyCosts);
  };

  useEffect(() => {
    calculateBudget();
  }, [commitments, hourlyRates, roles, workingDays, workingHours, chunks, hourlyCosts]);

  const calculateBudget = () => {
    const newBudget = {};
    let grandTotal = 0;
    const grandTotalBreakdown = {};
    const grandTotalHours = {};
    const grandTotalCommitments = {};
    const grandTotalGrossMargin = {};

    chunks.forEach(chunk => {
      newBudget[chunk] = { 
        total: 0, 
        breakdown: {}, 
        hours: {}, 
        commitments: {}, 
        grossMargin: {},
        totalGrossMargin: 0,
        totalGrossMarginPercentage: 0
      };
      let chunkRevenue = 0;
      let chunkCost = 0;

      roles.forEach(role => {
        const commitment = commitments[role.id]?.[chunk] || 0;
        const days = workingDays[chunk] || 0;
        const hoursPerDay = workingHours[role.id] === '' ? 0 : (workingHours[role.id] ?? 8);
        const hours = Math.round(days * hoursPerDay * commitment / 100);
        const revenue = hours * (hourlyRates[role.id] || 0);
        const cost = hours * (hourlyCosts[role.id] || 0);
        const grossMargin = revenue - cost;
        const grossMarginPercentage = revenue > 0 ? (grossMargin / revenue) * 100 : 0;

        newBudget[chunk].breakdown[role.id] = revenue;
        newBudget[chunk].hours[role.id] = hours;
        newBudget[chunk].commitments[role.id] = commitment;
        newBudget[chunk].grossMargin[role.id] = grossMarginPercentage;
        newBudget[chunk].total += revenue;

        chunkRevenue += revenue;
        chunkCost += cost;

        grandTotalBreakdown[role.id] = (grandTotalBreakdown[role.id] || 0) + revenue;
        grandTotalHours[role.id] = (grandTotalHours[role.id] || 0) + hours;
        grandTotalCommitments[role.id] = (grandTotalCommitments[role.id] || 0) + commitment;
        grandTotalGrossMargin[role.id] = (grandTotalGrossMargin[role.id] || 0) + grossMargin;
      });

      newBudget[chunk].totalGrossMargin = chunkRevenue - chunkCost;
      newBudget[chunk].totalGrossMarginPercentage = chunkRevenue > 0 ? ((chunkRevenue - chunkCost) / chunkRevenue) * 100 : 0;
      grandTotal += newBudget[chunk].total;
    });

    Object.keys(grandTotalCommitments).forEach(roleId => {
      grandTotalCommitments[roleId] = Math.round(grandTotalCommitments[roleId] / chunks.length);
      grandTotalGrossMargin[roleId] = grandTotalBreakdown[roleId] > 0 
        ? (grandTotalGrossMargin[roleId] / grandTotalBreakdown[roleId]) * 100 
        : 0;
    });

    newBudget.total = { 
      total: grandTotal, 
      breakdown: grandTotalBreakdown,
      hours: grandTotalHours,
      commitments: grandTotalCommitments,
      grossMargin: grandTotalGrossMargin
    };
    
    setBudget(newBudget);
  };

  const handleDiscountChange = (value) => {
    setDiscount(parseFloat(value) || 0);
  };  

  const calculateTotalSummary = () => {
    const summary = budget.total || {
      total: 0,
      breakdown: {},
      hours: {},
      commitments: {},
      grossMargin: {}
    };

    const discountAmount = (summary.total * discount) / 100;
    const discountedTotal = summary.total - discountAmount;

    return {
      ...summary,
      discountPercentage: discount,
      discountAmount: discountAmount,
      discountedTotal: discountedTotal
    };
  };

  const handleHourlyCostChange = (roleId, value) => {
    const newValue = value === '' ? '' : parseInt(value) || 0;
    setHourlyCosts(prev => ({ ...prev, [roleId]: newValue }));
    
    // Update the predefined role if it matches
    const updatedRole = roles.find(r => r.id === roleId);
    if (updatedRole) {
      setPredefinedRoles(prev => 
        prev.map(r => r.name === updatedRole.name ? { ...r, hourlyCost: newValue } : r)
      );
    }
  };

  const handleCommitmentChange = (roleId, chunk, value) => {
    const chunksToUpdate = selectedChunks.length > 0 ? selectedChunks : [chunk];
    setCommitments(prev => {
      const newCommitments = { ...prev };
      chunksToUpdate.forEach(m => {
        newCommitments[roleId] = { ...newCommitments[roleId], [m]: value[0] };
      });
      return newCommitments;
    });
  };

  const handleHourlyRateChange = (roleId, value) => {
    const newValue = value === '' ? '' : parseInt(value) || 0;
    setHourlyRates(prev => ({ ...prev, [roleId]: newValue }));
    
    // Update the predefined role if it matches
    const updatedRole = roles.find(r => r.id === roleId);
    if (updatedRole) {
      setPredefinedRoles(prev => 
        prev.map(r => r.name === updatedRole.name ? { ...r, hourlyRate: newValue } : r)
      );
    }
  };

  const handleWorkingDaysChange = (chunk, value) => {
    const chunksToUpdate = selectedChunks.length > 0 ? selectedChunks : [chunk];
    setWorkingDays(prev => {
      const newWorkingDays = { ...prev };
      chunksToUpdate.forEach(m => {
        newWorkingDays[m] = value === '' ? '' : parseInt(value) || 0;
      });
      return newWorkingDays;
    });
  };

  const handleWorkingHoursChange = (roleId, value) => {
    const parsedValue = value === '' ? '' : parseFloat(value);
    setWorkingHours(prev => ({ ...prev, [roleId]: parsedValue }));
  };

  const handleAddRole = () => {
    const newId = Date.now().toString(); // Use timestamp as unique ID
    const defaultRole = predefinedRoles[0];
    setRoles(prev => [...prev, { 
      id: newId, 
      name: defaultRole.name,
      code: defaultRole.code 
    }]);
    setCommitments(prev => ({
      ...prev,
      [newId]: chunks.reduce((acc, chunk) => ({ ...acc, [chunk]: 50 }), {})
    }));
    setHourlyRates(prev => ({ ...prev, [newId]: defaultRole.hourlyRate }));
    setHourlyCosts(prev => ({ ...prev, [newId]: defaultRole.hourlyCost }));
    setWorkingHours(prev => ({ ...prev, [newId]: 8 }));
  };

  const handleRoleChange = (roleId, newRoleName) => {
    const selectedRole = predefinedRoles.find(role => role.name === newRoleName);
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name: newRoleName, code: selectedRole.code } : r));
    setHourlyRates(prev => ({ ...prev, [roleId]: selectedRole.hourlyRate }));
    setHourlyCosts(prev => ({ ...prev, [roleId]: selectedRole.hourlyCost }));
  };

  const handleAliasChange = (roleId, newAlias) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, alias: newAlias } : r));
  };

  const handleRemoveRole = (idToRemove) => {
    setRoles(prev => prev.filter(role => role.id !== idToRemove));
    setCommitments(prev => {
      const { [idToRemove]: _, ...rest } = prev;
      return rest;
    });
    setHourlyRates(prev => {
      const { [idToRemove]: _, ...rest } = prev;
      return rest;
    });
    setWorkingHours(prev => {
      const { [idToRemove]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleAddChunk = () => {
    setIsAddingChunk(true);
  };

  const generateChunks = (template) => {
    const currentYear = new Date().getFullYear();
    switch (template) {
      case 'quarters':
        return {
          chunks: ['Q1', 'Q2', 'Q3', 'Q4'],
          workingDays: 56
        };
      case 'years':
        return {
          chunks: [currentYear.toString(), (currentYear + 1).toString(), (currentYear + 2).toString()],
          workingDays: 224
        };
      case 'months':
        return {
          chunks: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          workingDays: 21
        };
      case 'sprints':
        return {
          chunks: ['Sprint 1', 'Sprint 2', 'Sprint 3'],
          workingDays: 15
        };
      default:
        return {
          chunks: [],
          workingDays: 21 // Default for custom chunks
        };
    }
  };

  const confirmAddChunk = () => {
    let chunksToAdd = [];
    let templateWorkingDays = 21; // Default for custom chunks

    if (chunkTemplate === 'custom') {
      if (newChunkName && !chunks.includes(newChunkName.toLowerCase())) {
        chunksToAdd = [newChunkName.toLowerCase()];
      }
    } else {
      const { chunks: generatedChunks, workingDays } = generateChunks(chunkTemplate);
      chunksToAdd = generatedChunks.filter(chunk => !chunks.includes(chunk.toLowerCase()));
      templateWorkingDays = workingDays;
    }

    if (chunksToAdd.length > 0) {
      setChunks(prev => [...prev, ...chunksToAdd]);
      setChunkOrder(prev => [...prev, ...chunksToAdd]);
      
      const newWorkingDays = { ...workingDays };
      const newCommitments = { ...commitments };
      
      chunksToAdd.forEach(chunk => {
        newWorkingDays[chunk] = templateWorkingDays;
        Object.keys(newCommitments).forEach(roleId => {
          if (!newCommitments[roleId]) newCommitments[roleId] = {};
          newCommitments[roleId][chunk] = 50; // Default commitment
        });
      });

      setWorkingDays(newWorkingDays);
      setCommitments(newCommitments);
    }

    setNewChunkName('');
    setIsAddingChunk(false);
    setChunkTemplate('custom');
  };

  const handleRemoveChunk = () => {
    if (chunks.length > 1 && selectedChunks.length > 0) {
      setChunks(prev => prev.filter(chunk => !selectedChunks.includes(chunk)));
      setChunkOrder(prev => prev.filter(chunk => !selectedChunks.includes(chunk)));
      setWorkingDays(prev => {
        const newWorkingDays = { ...prev };
        selectedChunks.forEach(chunk => {
          delete newWorkingDays[chunk];
        });
        return newWorkingDays;
      });
      setCommitments(prev => {
        const newCommitments = { ...prev };
        Object.keys(newCommitments).forEach(roleId => {
          selectedChunks.forEach(chunk => {
            delete newCommitments[roleId][chunk];
          });
        });
        return newCommitments;
      });
      setSelectedChunks([]);
      setActiveTab(chunks.find(chunk => !selectedChunks.includes(chunk)) || chunks[0]);
    }
  };

  const handleChunkSelect = (chunk, event) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedChunks(prev => {
        const newSelection = prev.includes(chunk)
          ? prev.filter(m => m !== chunk)
          : [...prev, chunk];
        return newSelection.length === 0 ? chunks : newSelection;
      });
    } else {
      setSelectedChunks(prev => 
        prev.length === 1 && prev[0] === chunk ? chunks : [chunk]
      );
    }
    setActiveTab(chunk);
  };

  useEffect(() => {
    if (selectedChunks.length === 0) {
      setSelectedChunks(chunks);
    }
    if (selectedChunks.length > 0 && !activeTab) {
      setActiveTab(selectedChunks[0]);
    }
  }, [selectedChunks, chunks, activeTab]);

  const handleChunkDoubleClick = (chunk) => {
    setEditingChunk(chunk);
    // Use setTimeout to ensure the input is rendered before trying to focus and select
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 0);
  };
  
  const handleChunkNameChange = (oldName, newName) => {
    if (newName && newName !== oldName && !chunks.includes(newName.toLowerCase())) {
      const lowerNewName = newName.toLowerCase();
      setChunks(prev => prev.map(m => m === oldName ? lowerNewName : m));
      setChunkOrder(prev => prev.map(m => m === oldName ? lowerNewName : m));
      setWorkingDays(prev => {
        const { [oldName]: value, ...rest } = prev;
        return { ...rest, [lowerNewName]: value };
      });
      setCommitments(prev => {
        const newCommitments = { ...prev };
        Object.keys(newCommitments).forEach(roleId => {
          const { [oldName]: value, ...rest } = newCommitments[roleId];
          newCommitments[roleId] = { ...rest, [lowerNewName]: value };
        });
        return newCommitments;
      });
      setEditingChunk(null);
      
      // Set the active tab to the newly renamed chunk
      setActiveTab(lowerNewName);
      
      // Update selected chunks if the renamed chunk was selected
      setSelectedChunks(prev => prev.map(m => m === oldName ? lowerNewName : m));

      // Force a re-render to ensure the tab becomes active
      setTimeout(() => {
        setActiveTab(lowerNewName);
      }, 0);
    } else {
      setEditingChunk(null);
    }
  };

  useEffect(() => {
    if (editingChunk && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingChunk]);

  useEffect(() => {
    if (selectedChunks.length > 0) {
      setActiveTab(selectedChunks[selectedChunks.length - 1]);
    } else {
      setActiveTab('');
    }
  }, [selectedChunks]);

  const handleDownloadCSV = () => {
    const csvContent = generateCSV(budget, roles, chunks, commitments, hourlyRates, workingDays);
    downloadCSV(csvContent);
  };

  const onDragStart = (e, index) => {
    if (e.target.closest('.drag-handle')) {
      e.stopPropagation();
      setDraggedItem(roles[index]);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify({ type: 'role', index }));
    }
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, index) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return; // If there's no valid data, do nothing

    try {
      const { type, index: draggedIndex } = JSON.parse(data);
      if (type !== 'role') return; // If it's not our 'role' type, do nothing

      const draggedItem = roles[draggedIndex];
      if (!draggedItem) return; // If we can't find the dragged item, do nothing

      let newRoles = roles.filter((_, i) => i !== draggedIndex);
      newRoles.splice(index, 0, draggedItem);

      setRoles(newRoles);
      setDraggedItem(null);
    } catch (error) {
      console.error("Error processing drop:", error);
    }
  };

  const onDragEnd = () => {
    setDraggedItem(null);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const InfoModal = () => (
  <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>How to Use the Quote Simulator</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <ol className="list-decimal list-inside space-y-2">
          <li>Add or remove roles using the "Add Role" and "X" buttons.</li>
          <li>Add or remove chunks (time periods, projects, whatever) using the "Add Chunk" and "Remove Chunk" buttons.</li>
          <li>Double-click a chunk name in the tabs section to edit it.</li>
          <li>Use Ctrl/Cmd + click to select multiple chunks for bulk editing of commitment levels.</li>
          <li>Set working days for each chunk, and adjust commitment percentage, hourly rate, hourly cost, and working hours per day for each role.</li>
          <li>Drag and drop roles to reorder them.</li>
          <li>View budget breakdowns for each chunk and the total, including gross margin calculations.</li>
          <li>Import a rate card CSV to update role rates and costs.</li>
          <li>Export your current setup as a JSON file for later use.</li>
          <li>Import a previously saved JSON file to restore a saved configuration.</li>
          <li>Toggle dark mode for different viewing options.</li>
        </ol>
      </DialogDescription>
    </DialogContent>
  </Dialog>
);

  const generateCSV = (budget, roles, chunks, commitments, hourlyRates, workingDays) => {
    let csvContent = "chunk;role;commitmentLevel;hourlyRate;workingHoursPerDay;hours;amount\n";

    chunks.forEach(chunk => {
      roles.forEach(role => {
        const commitment = commitments[role.id]?.[chunk] || 0;
        const hourlyRate = hourlyRates[role.id] || 0;
        const days = workingDays[chunk] || 21;
        const workingHoursPerDay = workingHours[role.id] || 8; // Updated to use 8 as default
        const hours = Math.round(days * workingHoursPerDay * commitment / 100);
        const amount = budget[chunk]?.breakdown?.[role.id] || 0;

        csvContent += `"${chunk}";"${role.name}";"${commitment}";"${hourlyRate}";"${workingHoursPerDay}";"${hours}";"${amount}"\n`;
      });
    });

    return csvContent;
  };

  const downloadCSV = (csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "budget_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const calculateAverageHourlyRate = (totalSummary) => {
    const totalHours = Object.values(totalSummary.hours).reduce((sum, hours) => sum + hours, 0);
    const totalAmount = Object.values(totalSummary.breakdown).reduce((sum, amount) => sum + amount, 0);
    return totalHours > 0 ? Math.round(totalAmount / totalHours) : 0;
  };

  const calculateGrossMargin = (totalSummary) => {
    let totalRevenue = totalSummary.discountedTotal || 0;
    let totalCost = 0;

    roles.forEach(role => {
      const hours = totalSummary.hours[role.id] || 0;
      const cost = hours * (hourlyCosts[role.id] || 0);
      totalCost += cost;
    });

    const grossMargin = totalRevenue - totalCost;
    const grossMarginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    return {
      monetary: grossMargin,
      percentage: grossMarginPercentage
    };
  };

  return (
    <div className={`p-4 w-full min-w-fit ${darkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quote Simulator</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">v{version}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsInfoOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Info className="h-5 w-5" />
          </Button>
          <Sun className="h-4 w-4" />
          <Switch
            checked={darkMode}
            onCheckedChange={toggleDarkMode}
            aria-label="Toggle dark mode"
          />
          <Moon className="h-4 w-4" />
        </div>
      </div>

      <Card className="mb-6 2xl:w-2/5">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="simulationName" className="block text-sm font-medium mb-1 text-left">
                Simulation/Quote Name
              </label>
              <Input
                id="simulationName"
                value={simulationName}
                onChange={(e) => setSimulationName(e.target.value)}
                placeholder="Enter simulation/quote name"
              />
            </div>
            <div>
              <label htmlFor="simulationDescription" className="block text-sm font-medium mb-1 text-left">
                Description
              </label>
              <Textarea
                id="simulationDescription"
                value={simulationDescription}
                onChange={(e) => setSimulationDescription(e.target.value)}
                placeholder="Enter simulation/quote description"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={handleAddRole} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Role
        </Button>
        <Button onClick={handleAddChunk} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Chunk(s)
        </Button>
        <Button 
          onClick={handleRemoveChunk} 
          variant="destructive"
          className="flex items-center"
          disabled={chunks.length <= 1 || selectedChunks.length === 0}
        >
          <X className="mr-2 h-4 w-4" /> Remove Chunk(s)
        </Button>
{/*
        <Button onClick={handleDownloadCSV} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Download CSV
        </Button>
        <CSVUpload onDataUploaded={handleDataUploaded} />
*/}        
        <RateCardCSVUpload onRateCardUploaded={handleRateCardUploaded} />

        <Button onClick={handleExportJSON} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Export JSON
        </Button>
        <Button onClick={() => document.getElementById('import-json').click()} className="flex items-center">
          <Upload className="mr-2 h-4 w-4" /> Import JSON
        </Button>
        <input
          id="import-json"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportJSON}
        />            
      </div>

      {rateCardName && (
        <div className="mb-4 flex items-center">
          <h2 className="text-xl font-bold">Current Rate Card: {rateCardName}</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsRateCardModalOpen(true)} 
            className="ml-2"
            title="View Rate Card"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      )}   

      {isAddingChunk && (
        <div className="mb-4 space-y-4">
          <div>
            <label htmlFor="chunkTemplate" className="block text-sm font-medium mb-1 text-left">
              Select Chunk Template:
            </label>
            <Select
              id="chunkTemplate"
              value={chunkTemplate}
              onValueChange={setChunkTemplate}
            >
              <SelectTrigger className="w-1/5">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="quarters">Quarters (56 working days each)</SelectItem>
                <SelectItem value="years">Years (224 working days each)</SelectItem>
                <SelectItem value="months">Months (21 working days each)</SelectItem>
                <SelectItem value="sprints">Sprints (15 working days each)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {chunkTemplate === 'custom' && (
            <div>
              <label htmlFor="newChunkName" className="block text-sm font-medium mb-1 w-1/5 text-left">
                New Chunk Name:
              </label>
              <Input
                id="newChunkName"
                className="w-1/5"
                value={newChunkName}
                onChange={(e) => setNewChunkName(e.target.value)}
                placeholder="Enter new chunk name"
              />
            </div>
          )}
          <div className="flex space-x-2">
            <Button onClick={confirmAddChunk}>Confirm</Button>
            <Button onClick={() => {
              setIsAddingChunk(false);
              setChunkTemplate('custom');
              setNewChunkName('');
            }} variant="outline">Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="xl:w-2/5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-gray-100 p-1 rounded-lg mb-6 h-auto max-h-40 overflow-y-auto">
              <TabsList className="w-full flex flex-wrap justify-start bg-transparent !h-auto">
                {chunks.map(chunk => (
                  <TabsTrigger 
                    key={chunk} 
                    value={chunk} 
                    onClick={(e) => handleChunkSelect(chunk, e)}
                    onDoubleClick={() => handleChunkDoubleClick(chunk)}
                    className={`px-1 py-1 m-1 border-b-2 ${
                      selectedChunks.includes(chunk) 
                        ? 'border-blue-500 bg-blue-100' 
                        : 'border-transparent hover:border-gray-300'
                    } focus:outline-none`}
                  >
                    {editingChunk === chunk ? (
                      <Input
                        ref={editInputRef}
                        defaultValue={capitalize(chunk)}
                        onBlur={(e) => handleChunkNameChange(chunk, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleChunkNameChange(chunk, e.target.value);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 p-0 h-6 text-center"
                      />
                    ) : (
                      capitalize(chunk)
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="mt-4 text-left">
              <h3 className="font-semibold">Selected Chunk(s):</h3>
              <p>{selectedChunks.map(capitalize).join(', ') || 'None'}</p>
            </div>
            {selectedChunks.length > 0 && (
            <>
              {chunks.map(chunk => (
                <TabsContent key={chunk} value={chunk}>
                  <div className="mt-8 mb-8 flex justify-between items-center">
                    <label className="block text-sm font-medium">
                      Working days in {capitalize(chunk)} (CHECK MANUALLY!):
                        <Input
                          type="number"
                          value={workingDays[chunk] ?? ''}
                          onChange={(e) => handleWorkingDaysChange(chunk, e.target.value)}
                          className="mt-1 block w-full"
                          min="0"
                          max="31"
                        />
                      </label>
                    </div>
                  <div className="space-y-4 mb-6">
                    {roles.map((role, index) => (
                      <div
                        key={role.id}
                        className="p-4 border rounded-lg relative role-card"
                        onDragOver={(e) => onDragOver(e, index)}
                        onDrop={(e) => onDrop(e, index)}
                      >
                        <div className="flex items-center mb-2">
                          <div 
                            className="mr-2 cursor-move drag-handle"
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragEnd={onDragEnd}
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-grow">
                            <SearchableRoleSelect
                              roles={sortedPredefinedRoles}
                              value={role.name}
                              onChange={(value) => handleRoleChange(role.id, value)}
                            />
                          </div>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            className="ml-2 h-6 w-6" 
                            onClick={() => handleRemoveRole(role.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="w-32">
                            <span className="text-sm">Hourly Rate</span>
                            <Input
                              type="number"
                              value={hourlyRates[role.id] ?? ''}
                              onChange={(e) => handleHourlyRateChange(role.id, e.target.value)}
                              className="mt-1 text-center"
                            />
                          </div>
                          <div className="w-32">
                            <span className="text-sm">Hourly Cost</span>
                            <Input
                              type="number"
                              value={hourlyCosts[role.id] ?? ''}
                              onChange={(e) => handleHourlyCostChange(role.id, e.target.value)}
                              className="mt-1 text-center"
                            />
                          </div>
                          <div className="w-32">
                            <span className="text-sm">Hours/Day</span>
                            <Input
                              type="number"
                              value={workingHours[role.id] ?? 8}
                              onChange={(e) => handleWorkingHoursChange(role.id, e.target.value)}
                              className="mt-1 text-center"
                              step="0.5"
                              min="0"
                            />
                          </div>
                          <div className="w-32">
                            <span className="text-sm">Alias</span>
                            <Input
                              type="text"
                              value={role.alias}
                              onChange={(e) => handleAliasChange(role.id, e.target.value)}
                              placeholder="Alias"
                              className="mt-1 text-center"
                            />
                          </div>
                          <div className="flex-grow min-w-[200px] ">
                            <span className="text-sm">Commitment: {commitments[role.id]?.[chunk] || 0}%</span>
                            <Slider
                              value={[commitments[role.id]?.[chunk] || 0]}
                              max={100}
                              step={1}
                              onValueChange={(val) => handleCommitmentChange(role.id, chunk, val)}
                              className="mt-2"
                            />
                          </div>
{/*
                          <span className="ml-2 text-sm text-gray-500">Role Code: {role.code}</span>
*/}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>
      </div>

      <div className="xl:w-3/5 space-y-4">
        <Card>
         <CardHeader>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total Summary</span>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(calculateTotalSummary().discountedTotal)} SEK</div>
              <div className="text-sm">
                GM: {formatCurrency(calculateGrossMargin(calculateTotalSummary()).monetary)} SEK 
                ({calculateGrossMargin(calculateTotalSummary()).percentage.toFixed(2)}%)
              </div>
            </div>
          </div>
        </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center">
              <label className="mr-2 font-semibold text-red-600">Discount (%): </label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-20 border-red-500 focus:ring-red-500 focus:border-red-500 text-red-600"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-8 font-medium">
                <span className="col-span-2 text-left">Role</span>
                <span className="text-right">Avg. Commitment</span>
                <span className="text-right">Total Hours</span>
                <span className="text-right">Hourly Rate</span>
                <span className="text-right">GM</span>
                <span className="text-right">GM %</span>
                <span className="text-right">Total Amount</span>
              </div>
              {roles.map(role => {
                const totalSummary = calculateTotalSummary();
                const roleRevenue = totalSummary.breakdown[role.id] || 0;
                const roleHours = totalSummary.hours[role.id] || 0;
                const roleCost = roleHours * (hourlyCosts[role.id] || 0);
                const roleGrossMargin = roleRevenue - roleCost;
                return (
                  <div key={role.id} className="grid grid-cols-8">
                    <span className="col-span-2 truncate text-left" title={`${role.name}${role.alias ? ` (${role.alias})` : ''}`}>
                      {role.name}{role.alias ? ` (${role.alias})` : ''}
                    </span>
                    <span className="text-right">{totalSummary.commitments[role.id] || 0}%</span>
                    <span className="text-right">{roleHours}</span>
                    <span className="text-right">{hourlyRates[role.id] || 0} SEK</span>
                    <span className="text-right">{roleGrossMargin.toLocaleString()} SEK</span>
                    <span className="text-right">{(totalSummary.grossMargin[role.id] || 0).toFixed(2)}%</span>
                    <span className="text-right">{roleRevenue.toLocaleString()} SEK</span>
                  </div>
                );
              })}
              <div className="grid grid-cols-8 font-bold pt-2 border-t">
                <span className="col-span-2 text-left">Grand Total</span>
                <span className="text-right">
                  {Object.values(calculateTotalSummary().commitments).reduce((sum, value) => sum + (value || 0), 0)}%
                </span>
                <span className="text-right">
                  {Object.values(calculateTotalSummary().hours).reduce((sum, value) => sum + (value || 0), 0)}
                </span>
                <span className="text-right">
                  {formatCurrency(calculateAverageHourlyRate(calculateTotalSummary()))} SEK
                </span>
                <span className="text-right">
                  {formatCurrency(calculateGrossMargin(calculateTotalSummary()).monetary)} SEK
                </span>
                <span className="text-right">
                  {calculateGrossMargin(calculateTotalSummary()).percentage.toFixed(2)}%
                </span>
                <span className="text-right">
                  {formatCurrency(calculateTotalSummary().total)} SEK
                </span>
              </div>
              <div className="grid grid-cols-7 text-sm italic text-red-600 font-semibold">
                <span className="col-span-5 text-left">Discount ({discount}%)</span>
                <span className="col-span-2 text-right">
                  -{formatCurrency(calculateTotalSummary().discountAmount)} SEK
                </span>
              </div>
              <div className="grid grid-cols-7 font-bold text-lg">
                <span className="col-span-5 text-left">Discounted Total</span>
                <span className="col-span-2 text-right">
                  {formatCurrency(calculateTotalSummary().discountedTotal)} SEK
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {chunkOrder.map((period, index) => {
          const { total, breakdown, hours, commitments, grossMargin, totalGrossMargin, totalGrossMarginPercentage } = budget[period] || {};
          const isSelected = selectedChunks.includes(period);
          return (
            <Card 
              key={index} 
              className={`transition-all duration-200 ${isSelected ? 'border-blue-500 border-2' : ''}`}
            >
              <CardHeader className="text-xl font-bold">
                <div className="flex justify-between items-center">
                  <span>{capitalize(period)}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(total)} SEK</div>
                    <div className="text-sm font-normal">
                      GM: {formatCurrency(totalGrossMargin)} SEK ({totalGrossMarginPercentage?.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </CardHeader>
              {breakdown && hours && commitments && grossMargin && (
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-8 font-medium">
                      <span className="col-span-2 text-left">Role</span>
                      <span className="text-right">Commitment</span>
                      <span className="text-right">Hours</span>
                      <span className="text-right">Hourly Rate</span>
                      <span className="text-right">GM</span>
                      <span className="text-right">GM %</span>
                      <span className="text-right">Amount</span>
                    </div>
                    {roles.map(role => {
                      const roleRevenue = breakdown[role.id] || 0;
                      const roleHours = hours[role.id] || 0;
                      const roleCost = roleHours * (hourlyCosts[role.id] || 0);
                      const roleGrossMargin = roleRevenue - roleCost;
                      const roleGrossMarginPercentage = roleRevenue > 0 ? (roleGrossMargin / roleRevenue) * 100 : 0;
                      return (
                        <div key={role.id} className="grid grid-cols-8">
                          <span className="col-span-2 truncate text-left" title={`${role.name}${role.alias ? ` (${role.alias})` : ''}`}>
                            {role.name}{role.alias ? ` (${role.alias})` : ''}
                          </span>
                          <span className="text-right">{commitments[role.id] || 0}%</span>
                          <span className="text-right">{hours[role.id] || 0}</span>
                          <span className="text-right">{hourlyRates[role.id] || 0} SEK</span>
                          <span className="text-right">{formatCurrency(roleGrossMargin)} SEK</span>
                          <span className="text-right">{roleGrossMarginPercentage.toFixed(2)}%</span>
                          <span className="text-right">{formatCurrency(breakdown[role.id] || 0)} SEK</span>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-8 font-bold pt-2 border-t">
                      <span className="col-span-2 text-left">Total</span>
                      <span className="text-right">
                        {Object.values(commitments).reduce((sum, value) => sum + (value || 0), 0)}%
                      </span>
                      <span className="text-right">
                        {Object.values(hours).reduce((sum, value) => sum + (value || 0), 0)}
                      </span>
                      <span className="text-right">
                        {calculateAverageHourlyRate({ hours, breakdown })} SEK
                      </span>
                      <span className="text-right">
                        {formatCurrency(totalGrossMargin)} SEK
                      </span>
                      <span className="text-right">
                        {totalGrossMarginPercentage?.toFixed(2)}%
                      </span>
                      <span className="text-right">
                        {formatCurrency(total)} SEK
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            );
          })}
        </div>
      </div>

      <InfoModal />
      <RateCardModal
        isOpen={isRateCardModalOpen}
        onClose={() => setIsRateCardModalOpen(false)}
        rateCardName={rateCardName}
        predefinedRoles={predefinedRoles}
      />      
      
    </div>
  );
};

export default QuoteCalculator;