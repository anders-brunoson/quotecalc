import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, GripVertical, Moon, Sun, Info, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
  const [chunks, setChunks] = useState(['2025 H1', '2025 H2']);
  const [roles, setRoles] = useState([
    { id: '1', name: 'Systems Developer BE' },
    { id: '2', name: 'Systems Developer FE' },
    { id: '3', name: 'UX Designer' },
    { id: '4', name: 'Digital Designer' },
    { id: '5', name: 'Project Manager' }
  ]);

  const [commitments, setCommitments] = useState({});
  const [hourlyRates, setHourlyRates] = useState({});
  const [hourlyCosts, setHourlyCosts] = useState({});
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

  const calculateTotalSummary = () => {
    return budget.total || {
      total: 0,
      breakdown: {},
      hours: {},
      commitments: {},
      grossMargin: {}
    };
  };

  const handleHourlyCostChange = (roleId, value) => {
    setHourlyCosts(prev => ({ ...prev, [roleId]: value === '' ? '' : parseInt(value) || 0 }));
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
    setHourlyRates(prev => ({ ...prev, [roleId]: value === '' ? '' : parseInt(value) || 0 }));
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
    setHourlyRates(prev => ({ ...prev, [newId]: 1000 }));
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
    let totalRevenue = 0;
    let totalCost = 0;

    roles.forEach(role => {
      const revenue = totalSummary.breakdown[role.id] || 0;
      const hours = totalSummary.hours[role.id] || 0;
      const cost = hours * (hourlyCosts[role.id] || 0);

      totalRevenue += revenue;
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
    <div className={`p-4 w-full ${darkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quote Simulator</h1>
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
                              value={hourlyRates[role.id] ?? ''}
                              onChange={(e) => handleHourlyRateChange(role.id, e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="w-32">
                            <span className="text-sm">Hourly Cost</span>
                            <Input
                              type="number"
                              value={hourlyCosts[role.id] ?? ''}
                              onChange={(e) => handleHourlyCostChange(role.id, e.target.value)}
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
      </div>

      <div className="xl:w-1/2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total Summary</span>
              <div className="text-right">
                <div className="text-2xl font-bold">{calculateTotalSummary().total.toLocaleString()} SEK</div>
                <div className="text-sm">
                  GM: {calculateGrossMargin(calculateTotalSummary()).monetary.toLocaleString()} SEK 
                  ({calculateGrossMargin(calculateTotalSummary()).percentage.toFixed(2)}%)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-7 font-medium">
                <span className="col-span-1 text-left">Role</span>
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
                  <div key={role.id} className="grid grid-cols-7">
                    <span className="col-span-1 truncate text-left" title={role.name}>{role.name}</span>
                    <span className="text-right">{totalSummary.commitments[role.id] || 0}%</span>
                    <span className="text-right">{roleHours}</span>
                    <span className="text-right">{hourlyRates[role.id] || 0} SEK</span>
                    <span className="text-right">{roleGrossMargin.toLocaleString()} SEK</span>
                    <span className="text-right">{(totalSummary.grossMargin[role.id] || 0).toFixed(2)}%</span>
                    <span className="text-right">{roleRevenue.toLocaleString()} SEK</span>
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
                  {calculateAverageHourlyRate(calculateTotalSummary())} SEK
                </span>
                <span className="text-right">
                  {calculateGrossMargin(calculateTotalSummary()).monetary.toLocaleString()} SEK
                </span>
                <span className="text-right">
                  {calculateGrossMargin(calculateTotalSummary()).percentage.toFixed(2)}%
                </span>
                <span className="text-right">
                  {calculateTotalSummary().total.toLocaleString()} SEK
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {chunkOrder.map((period, index) => {
          const { total, breakdown, hours, commitments, grossMargin, totalGrossMargin, totalGrossMarginPercentage } = budget[period] || {};
          return (
            <Card key={index}>
              <CardHeader className="capitalize">
                <div className="flex justify-between items-center">
                  <span>{period}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{total?.toLocaleString()} SEK</div>
                    <div className="text-sm">
                      GM: {totalGrossMargin?.toLocaleString()} SEK ({totalGrossMarginPercentage?.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </CardHeader>
              {breakdown && hours && commitments && grossMargin && (
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-7 font-medium">
                      <span className="col-span-1 text-left">Role</span>
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
                        <div key={role.id} className="grid grid-cols-7">
                          <span className="col-span-1 truncate text-left" title={role.name}>{role.name}</span>
                          <span className="text-right">{commitments[role.id] || 0}%</span>
                          <span className="text-right">{hours[role.id] || 0}</span>
                          <span className="text-right">{hourlyRates[role.id] || 0} SEK</span>
                          <span className="text-right">{roleGrossMargin?.toLocaleString()} SEK</span>
                          <span className="text-right">{roleGrossMarginPercentage.toFixed(2)}%</span>
                          <span className="text-right">{(breakdown[role.id] || 0).toLocaleString()} SEK</span>
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
                        {calculateAverageHourlyRate({ hours, breakdown })} SEK
                      </span>
                      <span className="text-right">
                        {totalGrossMargin?.toLocaleString()} SEK
                      </span>
                      <span className="text-right">
                        {totalGrossMarginPercentage?.toFixed(2)}%
                      </span>
                      <span className="text-right">
                        {total?.toLocaleString()} SEK
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
      
    </div>
  );
};

export default QuoteCalculator;