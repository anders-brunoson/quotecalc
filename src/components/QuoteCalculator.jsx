import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, GripVertical, Moon, Sun, Info, Download, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CSVUpload from './CSVUpload';

const QuoteCalculator = () => {
  const [chunks, setChunks] = useState(['2025 H1',`2025 H2`]);
  const [roles, setRoles] = useState([
    { id: '1', name: 'Systems Developer BE', type: 'Senior' },
    { id: '2', name: 'Systems Developer FE', type: 'Medior' },
    { id: '3', name: 'UX Designer', type: 'Junior' },
    { id: '4', name: 'Digital Designer', type: 'Senior' },
    { id: '5', name: 'Project Manager', type: 'Senior' }
  ]);

  const [hourlyCosts, setHourlyCosts] = useState({
    Junior: 500,
    Medior: 700,
    Senior: 1000
  });

  const [commitments, setCommitments] = useState({});
  const [hourlyRates, setHourlyRates] = useState({});
  const [workingDays, setWorkingDays] = useState({});
  const [workingHours, setWorkingHours] = useState({});
  const [budget, setBudget] = useState({});
  const [newChunkName, setNewChunkName] = useState('');
  const [isAddingChunk, setIsAddingChunk] = useState(false);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [editingChunk, setEditingChunk] = useState(null);
  const editInputRef = useRef(null);
  const [chunkOrder, setChunkOrder] = React.useState([]);
  const [openRoleSettings, setOpenRoleSettings] = useState(null);  

  const handleRoleTypeChange = (roleId, newType) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId ? { ...role, type: newType } : role
    ));
  };

  const handleDataUploaded = (data) => {
    setChunks(data.chunks);
    setRoles(data.roles);
    setCommitments(data.commitments);
    setHourlyRates(data.hourlyRates);
    setWorkingHours(data.workingHours);
    setWorkingDays(data.workingDays);
    setHourlyCosts(data.hourlyCosts);
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
    const initialWorkingDays = {};
    const initialWorkingHours = {};
    const initialHourlyRates = {};
    roles.forEach(role => {
      initialHourlyRates[role.id] = {};
      chunks.forEach(chunk => {
        initialHourlyRates[role.id][chunk] = 1000; // Default hourly rate
      });
    });

    roles.forEach(role => {
      initialCommitments[role.id] = {};
      initialHourlyRates[role.id] = {};
      initialWorkingHours[role.id] = 8;
      chunks.forEach(chunk => {
        initialCommitments[role.id][chunk] = 50;
        initialHourlyRates[role.id][chunk] = 1000;
        initialWorkingDays[chunk] = 21;
      });
    });

    setCommitments(initialCommitments);
    setHourlyRates(initialHourlyRates);
    setWorkingDays(initialWorkingDays);
    setWorkingHours(initialWorkingHours);
    setActiveTab(chunks[0]);
    setChunkOrder(chunks);
  };

  useEffect(() => {
    calculateBudget();
  }, [commitments, hourlyRates, roles, workingDays, workingHours, chunks]);

  const calculateBudget = () => {
    const newBudget = {};
    let grandTotal = 0;
    const grandTotalBreakdown = {};
    const grandTotalHours = {};
    const grandTotalCommitments = {};

    chunks.forEach(chunk => {
      newBudget[chunk] = { total: 0, breakdown: {}, hours: {}, commitments: {} };
      roles.forEach(role => {
        const commitment = commitments[role.id]?.[chunk] || 0;
        const days = workingDays[chunk] || 0;
        const hoursPerDay = workingHours[role.id] === '' ? 0 : (workingHours[role.id] ?? 8);
        const hours = Math.round(days * hoursPerDay * commitment / 100);
        const hourlyRate = hourlyRates[role.id]?.[chunk] || 0;
        const amount = hours * hourlyRate;
        newBudget[chunk].breakdown[role.id] = amount;
        newBudget[chunk].hours[role.id] = hours;
        newBudget[chunk].commitments[role.id] = commitment;
        newBudget[chunk].total += amount;

        grandTotalBreakdown[role.id] = (grandTotalBreakdown[role.id] || 0) + amount;
        grandTotalHours[role.id] = (grandTotalHours[role.id] || 0) + hours;
        grandTotalCommitments[role.id] = (grandTotalCommitments[role.id] || 0) + commitment;
      });
      grandTotal += newBudget[chunk].total;
    });

    Object.keys(grandTotalCommitments).forEach(roleId => {
      grandTotalCommitments[roleId] = Math.round(grandTotalCommitments[roleId] / chunks.length);
    });

    newBudget.total = { 
      total: grandTotal, 
      breakdown: grandTotalBreakdown,
      hours: grandTotalHours,
      commitments: grandTotalCommitments
    };
    
    setBudget(newBudget);
  };

  const handleHourlyRateChange = (roleId, chunk, value) => {
    const chunksToUpdate = selectedChunks.length > 0 ? selectedChunks : [chunk];
    setHourlyRates(prev => {
      const newHourlyRates = { ...prev };
      chunksToUpdate.forEach(m => {
        newHourlyRates[roleId] = { ...newHourlyRates[roleId], [m]: value === '' ? '' : parseInt(value) || 0 };
      });
      return newHourlyRates;
    });
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
    const newId = (roles.length + 1).toString();
    setRoles(prev => [...prev, { id: newId, name: `New Role ${newId}` }]);
    setCommitments(prev => ({
      ...prev,
      [newId]: chunks.reduce((acc, chunk) => ({ ...acc, [chunk]: 50 }), {})
    }));
    setHourlyRates(prev => ({
      ...prev,
      [newId]: chunks.reduce((acc, chunk) => ({ ...acc, [chunk]: 1000 }), {}) // Default hourly rate for new role
    }));
    setWorkingHours(prev => ({ ...prev, [newId]: 8 }));
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

  const confirmAddChunk = () => {
    if (newChunkName && !chunks.includes(newChunkName.toLowerCase())) {
      const chunkToAdd = newChunkName.toLowerCase();
      setChunks(prev => [...prev, chunkToAdd]);
      setChunkOrder(prev => [...prev, chunkToAdd]);
      setWorkingDays(prev => ({ ...prev, [chunkToAdd]: 21 }));
      setCommitments(prev => {
        const newCommitments = { ...prev };
        Object.keys(newCommitments).forEach(roleId => {
          newCommitments[roleId][chunkToAdd] = 50;
        });
        return newCommitments;
      });
      setHourlyRates(prev => {
        const newHourlyRates = { ...prev };
        Object.keys(newHourlyRates).forEach(roleId => {
          newHourlyRates[roleId][chunkToAdd] = 1000; // Default hourly rate
        });
        return newHourlyRates;
      });
      setNewChunkName('');
      setIsAddingChunk(false);
    }
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
      setHourlyRates(prev => {
        const newHourlyRates = { ...prev };
        Object.keys(newHourlyRates).forEach(roleId => {
          const { [oldName]: value, ...rest } = newHourlyRates[roleId];
          newHourlyRates[roleId] = { ...rest, [lowerNewName]: value || 1000 }; // Use existing value or default
        });
        return newHourlyRates;
      });
      setEditingChunk(null);
      
      setActiveTab(lowerNewName);
      setSelectedChunks(prev => prev.map(m => m === oldName ? lowerNewName : m));

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
        <DialogTitle>How to Use the Budget Calculator</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <ol className="list-decimal list-inside space-y-2">
          <li>Add or remove roles using the "Add Role" and "X" buttons.</li>
          <li>Add or remove chunks using the "Add Chunk" and "Remove Chunk" buttons.</li>
          <li>Duoble-click chunk in the tabs section at the top to edit it.</li> 
          <li>Ctrl/command + click to select multiple chunks to apply commitment level changes across them.</li>
          <li>Verify the number of working days for each chunk.</li>
          <li>Set the commitment percentage and hourly rate for each role.</li>
          <li>Drag and drop roles to reorder them.</li>
          <li>Use the dark mode toggle for different viewing options.</li>
          <li>View the calculated budget breakdown for each chunk and the total.</li>
          <li>Download budget data as CSV to use with Excel or to store it.</li>
          <li>Upload budget data as CSV (use same format as downloaded CSV).</li>
        </ol>
      </DialogDescription>
    </DialogContent>
  </Dialog>
);

  const generateCSV = (budget, roles, chunks, commitments, hourlyRates, workingDays, workingHours, hourlyCosts) => {
    let csvContent = "chunk;role;roleType;commitmentLevel;hourlyRate;hourlyCost;workingHoursPerDay;workingDays;hours;amount\n";

    chunks.forEach(chunk => {
      roles.forEach(role => {
        const commitment = commitments[role.id]?.[chunk] || 0;
        const hourlyRate = hourlyRates[role.id]?.[chunk] || 0;
        const days = workingDays[chunk] || 21;
        const workingHoursPerDay = workingHours[role.id] || 8;
        const hours = Math.round(days * workingHoursPerDay * commitment / 100);
        const amount = budget[chunk]?.breakdown?.[role.id] || 0;
        const roleType = role.type;
        const hourlyCost = hourlyCosts[roleType] || 0;

        csvContent += `"${chunk}";"${role.name}";"${roleType}";"${commitment}";"${hourlyRate}";"${hourlyCost}";"${workingHoursPerDay}";"${days}";"${hours}";"${amount}"\n`;
      });
    });

    return csvContent;
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV(budget, roles, chunkOrder, commitments, hourlyRates, workingDays, workingHours, hourlyCosts);
    downloadCSV(csvContent);
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

  const calculateTotalSummary = () => {
    const totalSummary = {
      total: 0,
      breakdown: {},
      hours: {},
      commitments: {},
      hourlyRates: {},
      grossMargin: {},
      grossMarginPercentage: {}
    };

    roles.forEach(role => {
      totalSummary.breakdown[role.id] = 0;
      totalSummary.hours[role.id] = 0;
      totalSummary.commitments[role.id] = 0;
      totalSummary.hourlyRates[role.id] = hourlyRates[role.id] || 0;
    });

    chunkOrder.forEach(chunk => {
      if (budget[chunk]) {
        totalSummary.total += budget[chunk].total || 0;
        roles.forEach(role => {
          totalSummary.breakdown[role.id] += budget[chunk].breakdown[role.id] || 0;
          totalSummary.hours[role.id] += budget[chunk].hours[role.id] || 0;
          totalSummary.commitments[role.id] += budget[chunk].commitments[role.id] || 0;
        });
      }
    });

    // Average out the commitments
    roles.forEach(role => {
      totalSummary.commitments[role.id] = Math.round(totalSummary.commitments[role.id] / chunkOrder.length);
    });

    roles.forEach(role => {
      const revenue = totalSummary.breakdown[role.id];
      const cost = totalSummary.hours[role.id] * hourlyCosts[role.type];
      totalSummary.grossMargin[role.id] = revenue - cost;
      totalSummary.grossMarginPercentage[role.id] = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
    });

    return totalSummary;
  };

  const calculateAverageHourlyRate = (roleId) => {
    const rates = chunks.map(chunk => hourlyRates[roleId]?.[chunk] || 0);
    const sum = rates.reduce((a, b) => a + b, 0);
    return Math.round(sum / chunks.length);
  };

  const calculateOverallAverageHourlyRate = () => {
    let totalRate = 0;
    let totalHours = 0;
    roles.forEach(role => {
      chunks.forEach(chunk => {
        const hours = budget[chunk]?.hours[role.id] || 0;
        totalRate += hours * (hourlyRates[role.id]?.[chunk] || 0);
        totalHours += hours;
      });
    });
    return totalHours > 0 ? Math.round(totalRate / totalHours) : 0;
  };

  const calculateChunkAverageHourlyRate = (chunk) => {
    let totalWeightedRate = 0;
    let totalHours = 0;
    roles.forEach(role => {
      const hours = budget[chunk]?.hours[role.id] || 0;
      totalWeightedRate += hours * (hourlyRates[role.id]?.[chunk] || 0);
      totalHours += hours;
    });
    return totalHours > 0 ? Math.round(totalWeightedRate / totalHours) : 0;
  };

  const RoleSettingsModal = ({ role, isOpen, onClose }) => {
    const [localHourlyCost, setLocalHourlyCost] = useState(hourlyCosts[role.type]);

    useEffect(() => {
      setLocalHourlyCost(hourlyCosts[role.type]);
    }, [role.type, hourlyCosts]);

    const handleRoleTypeChange = (newType) => {
      setRoles(prev => prev.map(r => 
        r.id === role.id ? { ...r, type: newType } : r
      ));
      setLocalHourlyCost(hourlyCosts[newType]);
    };

    const handleHourlyCostChange = (value) => {
      setLocalHourlyCost(value);
    };

    const handleSave = () => {
      setHourlyCosts(prev => ({
        ...prev,
        [role.type]: Number(localHourlyCost)
      }));
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings for {role.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-4">
              <div>
                <Label>Role Type</Label>
                <RadioGroup
                  value={role.type}
                  onValueChange={handleRoleTypeChange}
                  className="flex flex-col space-y-1 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Junior" id={`${role.id}-junior`} />
                    <Label htmlFor={`${role.id}-junior`}>Junior</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Medior" id={`${role.id}-medior`} />
                    <Label htmlFor={`${role.id}-medior`}>Medior</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Senior" id={`${role.id}-senior`} />
                    <Label htmlFor={`${role.id}-senior`}>Senior</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>Hourly Cost</Label>
                <Input
                  type="number"
                  value={localHourlyCost}
                  onChange={(e) => handleHourlyCostChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </DialogDescription>
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className={`p-4 w-full ${darkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quote Calculator</h1>
        <div className="flex items-center space-x-2">
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
      
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={handleAddRole} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Role
        </Button>
        <Button onClick={handleAddChunk} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Chunk
        </Button>
        <Button 
          onClick={handleRemoveChunk} 
          variant="destructive"
          className="flex items-center"
          disabled={chunks.length <= 1 || selectedChunks.length === 0}
        >
          <X className="mr-2 h-4 w-4" /> Remove Chunk(s)
        </Button>
        <Button onClick={handleDownloadCSV} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Download CSV
        </Button>
        <CSVUpload onDataUploaded={handleDataUploaded} />
      </div>

      {isAddingChunk && (
        <div className="mb-4 flex space-x-2">
          <Input
            value={newChunkName}
            onChange={(e) => setNewChunkName(e.target.value)}
            placeholder="Enter new chunk name"
          />
          <Button onClick={confirmAddChunk}>Confirm</Button>
          <Button onClick={() => setIsAddingChunk(false)} variant="outline">Cancel</Button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="xl:w-1/2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6 bg-gray-100 p-1 rounded-lg flex flex-wrap min-h-fit">
              <TabsList className="w-full flex flex-wrap justify-start bg-transparent">
                {chunks.map(chunk => (
                  <TabsTrigger 
                    key={chunk} 
                    value={chunk} 
                    onClick={(e) => handleChunkSelect(chunk, e)}
                    onDoubleClick={() => handleChunkDoubleClick(chunk)}
                    className={`px-1 py-1 border-b-2 ${
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
                          <span className="ml-2 text-xs text-gray-500">({role.type})</span>
                            </div>
                            <Input
                              value={role.name}
                              onChange={(e) => setRoles(prev => prev.map(r => r.id === role.id ? { ...r, name: e.target.value } : r))}
                              className="font-medium flex-grow"
                            />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="ml-2" 
                            onClick={() => setOpenRoleSettings(role.id)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="ml-2" 
                            onClick={() => handleRemoveRole(role.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex-grow min-w-[200px]">
                              <span className="text-sm">Commitment: {commitments[role.id]?.[chunk] || 0}%</span>
                              <Slider
                                value={[commitments[role.id]?.[chunk] || 0]}
                                max={100}
                                step={1}
                                onValueChange={(val) => handleCommitmentChange(role.id, chunk, val)}
                              />
                            </div>
                            <div className="w-32">
                              <span className="text-sm">Hourly Rate</span>
                              <Input
                                type="number"
                                value={hourlyRates[role.id]?.[chunk] ?? ''}
                                onChange={(e) => handleHourlyRateChange(role.id, chunk, e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="w-32">
                              <span className="text-sm">Hours/Day</span>
                              <Input
                                type="number"
                                value={workingHours[role.id] ?? 8}
                                onChange={(e) => handleWorkingHoursChange(role.id, e.target.value)}
                                className="mt-1"
                                step="0.5"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </>
            )}
          </Tabs>

          {selectedChunks.length === chunks.length && (
            <div className="mt-8 text-center text-gray-500">
              <p>All chunks are currently selected. Deselect individual chunks by Ctrl/Cmd + click.</p>
            </div>
          )}
        </div>

        <div className="xl:w-1/2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Summary</span>
                <span className="text-2xl font-bold">{calculateTotalSummary().total.toLocaleString()} SEK</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-7 font-medium">
                  <span className="col-span-1 text-left">Role</span>
                  <span className="text-right">Avg. Commitment</span>
                  <span className="text-right">Total Hours</span>
                  <span className="text-right">Avg. Hourly Rate</span>
                  <span className="text-right">Total Amount</span>
                  <span className="text-right">Gross Margin</span>
                  <span className="text-right">GM %</span>
                </div>
                {roles.map(role => {
                  const totalSummary = calculateTotalSummary();
                  const avgHourlyRate = calculateAverageHourlyRate(role.id);
                  return (
                    <div key={role.id} className="grid grid-cols-7">
                      <span className="col-span-1 truncate text-left" title={role.name}>{role.name}</span>
                      <span className="text-right">{totalSummary.commitments[role.id] || 0}%</span>
                      <span className="text-right">{totalSummary.hours[role.id] || 0}</span>
                      <span className="text-right">{avgHourlyRate} SEK</span>
                      <span className="text-right">{(totalSummary.breakdown[role.id] || 0).toLocaleString()} SEK</span>
                      <span className="text-right">{(totalSummary.grossMargin[role.id] || 0).toLocaleString()} SEK</span>
                      <span className="text-right">{totalSummary.grossMarginPercentage[role.id].toFixed(0)}%</span>
                    </div>
                  );
                })}
                <div className="grid grid-cols-7 font-bold pt-2 border-t">
                  <span className="col-span-1 text-left">Grand Total</span>
                  <span className="text-right">
                    {Object.values(calculateTotalSummary().commitments).reduce((sum, value) => sum + (value || 0), 0)}%
                  </span>
                  <span className="text-right">
                    {Object.values(calculateTotalSummary().hours).reduce((sum, value) => sum + (value || 0), 0)}
                  </span>
                  <span className="text-right">
                    {calculateOverallAverageHourlyRate()} SEK
                  </span>
                  <span className="text-right">
                    {calculateTotalSummary().total.toLocaleString()} SEK
                  </span>
                  <span className="text-right">
                    {Object.values(calculateTotalSummary().grossMargin).reduce((sum, value) => sum + (value || 0), 0).toLocaleString()} SEK
                  </span>
                  <span className="text-right">
                    {(Object.values(calculateTotalSummary().grossMargin).reduce((sum, value) => sum + (value || 0), 0) / calculateTotalSummary().total * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {chunkOrder.map((period, index) => {
            const { total, breakdown, hours, commitments } = budget[period] || {};
            const avgHourlyRate = calculateChunkAverageHourlyRate(period);
            return (
              <Card key={index}>
                <CardHeader className="capitalize">
                  <div className="flex justify-between items-center">
                    <span>{period}</span>
                    <span className="text-2xl font-bold">{total?.toLocaleString()} SEK</span>
                  </div>
                </CardHeader>
                {breakdown && hours && commitments && (
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-7 font-medium">
                        <span className="col-span-1 text-left">Role</span>
                        <span className="text-right">Commitment</span>
                        <span className="text-right">Hours</span>
                        <span className="text-right">Hourly Rate</span>
                        <span className="text-right">Amount</span>
                        <span className="text-right">Gross Margin</span>
                        <span className="text-right">GM %</span>
                      </div>
                      {roles.map(role => {
                        const revenue = breakdown[role.id] || 0;
                        const cost = (hours[role.id] || 0) * hourlyCosts[role.type];
                        const grossMargin = revenue - cost;
                        const grossMarginPercentage = revenue > 0 ? (grossMargin / revenue) * 100 : 0;
                        return (
                          <div key={role.id} className="grid grid-cols-7">
                            <span className="col-span-1 truncate text-left" title={role.name}>{role.name}</span>
                            <span className="text-right">{commitments[role.id] || 0}%</span>
                            <span className="text-right">{hours[role.id] || 0}</span>
                            <span className="text-right">{hourlyRates[role.id]?.[period] || 0} SEK</span>
                            <span className="text-right">{(breakdown[role.id] || 0).toLocaleString()} SEK</span>
                            <span className="text-right">{grossMargin.toLocaleString()} SEK</span>
                            <span className="text-right">{grossMarginPercentage.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                      <div className="grid grid-cols-7 font-bold pt-2 border-t">
                        <span className="col-span-1 text-left">Total</span>
                        <span className="text-right">
                          {Object.values(commitments).reduce((sum, value) => sum + (value || 0), 0)}%
                        </span>
                        <span className="text-right">
                          {Object.values(hours).reduce((sum, value) => sum + (value || 0), 0)}
                        </span>
                        <span className="text-right">
                          {avgHourlyRate} SEK
                        </span>
                        <span className="text-right">
                          {Object.values(breakdown).reduce((sum, value) => sum + (value || 0), 0).toLocaleString()} SEK
                        </span>
                        <span className="text-right">
                          {roles.reduce((sum, role) => {
                            const revenue = breakdown[role.id] || 0;
                            const cost = (hours[role.id] || 0) * hourlyCosts[role.type];
                            return sum + (revenue - cost);
                          }, 0).toLocaleString()} SEK
                        </span>
                        <span className="text-right">
                          {(roles.reduce((sum, role) => {
                            const revenue = breakdown[role.id] || 0;
                            const cost = (hours[role.id] || 0) * hourlyCosts[role.type];
                            return sum + (revenue - cost);
                          }, 0) / Object.values(breakdown).reduce((sum, value) => sum + (value || 0), 0) * 100).toFixed(0)}%
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

      {roles.map(role => (
        <RoleSettingsModal
          key={role.id}
          role={role}
          isOpen={openRoleSettings === role.id}
          onClose={() => setOpenRoleSettings(null)}
        />
      ))}      
      
    </div>
  );
};

export default QuoteCalculator;