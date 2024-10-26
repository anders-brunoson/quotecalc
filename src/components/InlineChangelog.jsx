import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const changelogData = [
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
        <CardTitle className="text-sm font-medium">Recent Changes</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-3">
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
      </CardContent>
    </Card>
  );
};

export default InlineChangelog;