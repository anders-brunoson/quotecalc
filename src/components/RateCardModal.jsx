import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RateCardModal = ({ isOpen, onClose, rateCardName, predefinedRoles }) => {
  const sortedRoles = [...predefinedRoles].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{rateCardName || 'Rate Card'}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left font-medium">Role Name</th>
                <th className="px-2 py-1 text-right font-medium">Hourly Rate</th>
                <th className="px-2 py-1 text-right font-medium">Hourly Cost</th>
                <th className="px-2 py-1 text-center font-medium">Role Code</th>
              </tr>
            </thead>
            <tbody>
              {sortedRoles.map((role, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 py-1">{role.name}</td>
                  <td className="px-2 py-1 text-right">{role.hourlyRate}</td>
                  <td className="px-2 py-1 text-right">{role.hourlyCost}</td>
                  <td className="px-2 py-1 text-center">{role.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateCardModal;