import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const changelogData = [
  {
    version: "0.12.0",
    date: "2024-12-03",
    changes: [
      "Multi-setup switcher",
      "Local storage in browser",
      "Renamed"
    ]
  },
  {
    version: "0.11.0",
    date: "2024-11-30",
    changes: [
      "Dynamic currency symbol"
    ]
  },
  {
    version: "0.10.7",
    date: "2024-11-29",
    changes: [
      "Role copy button"
    ]
  },
  {
    version: "0.10.6",
    date: "2024-10-30",
    changes: [
      "Commitment slider -> regular input"
    ]
  },
  {
    version: "0.10.5",
    date: "2024-10-29",
    changes: [
      "Lighter buttons",
      "Removed SEK to save space"
    ]
  },
  {
    version: "0.10.2",
    date: "2024-10-27",
    changes: [
      "Added role-specific per-chunk discounts feature",
      "Improved precision of hour calculations",
      "Added Recent Changes box"
    ]
  }
];

const InlineChangelog = () => {
  return (
    <Card className="w-100 text-left">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Latest Changes</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[180px] overflow-y-auto">
        <div className="text-xs space-y-3">
          {changelogData.map((release) => (
            <div key={release.version} className="pb-2 last:pb-0 border-b last:border-b-0">
              <div className="flex justify-right items-center mb-1">
                <span className="font-semibold">v{release.version}&nbsp;</span>
                <span className="text-gray-500">{release.date}</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {release.changes.map((change, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InlineChangelog;