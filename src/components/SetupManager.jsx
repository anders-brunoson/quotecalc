import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, PlusCircle, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SetupManager = ({ 
  setups,
  currentSetup,
  onSetupChange,
  onSetupCopy,
  onSetupDelete,
  onCreateEmpty,
  onWipeStorage
}) => {
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isWipeDialogOpen, setIsWipeDialogOpen] = useState(false);
  const [copySetupName, setCopySetupName] = useState("");

  const handleCopySetup = () => {
    if (!currentSetup?.simulationName) return;
    setCopySetupName(`${currentSetup.simulationName} (Copy)`);
    setIsCopyDialogOpen(true);
  };

  const confirmCopySetup = () => {
    if (copySetupName.trim()) {
      onSetupCopy(copySetupName.trim());
      setIsCopyDialogOpen(false);
      setCopySetupName("");
    }
  };

  const handleDeleteSetup = (setupId) => {
    if (confirm('Are you sure you want to delete this setup?')) {
      onSetupDelete(setupId);
    }
  };

  const confirmWipeStorage = () => {
    onWipeStorage();
    setIsWipeDialogOpen(false);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Select 
        value={currentSetup?.id || ''} 
        onValueChange={onSetupChange}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a setup">
            {currentSetup?.simulationName || "Select a setup"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {setups.map((setup) => (
            <SelectItem key={setup.id} value={setup.id}>
              {setup.simulationName || 'Unnamed Setup'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onCreateEmpty}
        title="Create empty setup"
      >
        <PlusCircle className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={handleCopySetup}
        title="Copy current setup"
      >
        <Copy className="h-4 w-4" />
      </Button>

      {currentSetup && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDeleteSetup(currentSetup.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Delete current setup"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsWipeDialogOpen(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Clear all data"
      >
        <Ban className="h-4 w-4" />
      </Button>

      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Setup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={copySetupName}
              onChange={(e) => setCopySetupName(e.target.value)}
              placeholder="Enter name for the copy"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmCopySetup}>
                Create Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWipeDialogOpen} onOpenChange={setIsWipeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Clear All Data</DialogTitle>
            <DialogDescription className="pt-4">
              <Alert variant="destructive">
                <AlertDescription>
                  This action will permanently delete all setups and cannot be undone.
                  All your saved configurations will be lost.
                </AlertDescription>
              </Alert>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 space-x-2">
            <Button variant="outline" onClick={() => setIsWipeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmWipeStorage}
            >
              Yes, Clear Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SetupManager;