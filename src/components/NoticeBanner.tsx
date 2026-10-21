import React from 'react';
import { Info } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div className="demo-disclaimer-banner" role="region" aria-label="Demonstration Notice">
      <span className="demo-pill">Demonstration Project</span>
      <Info size={16} aria-hidden="true" />
      <span>
        <strong>Academic Demonstration Notice:</strong> All facility records, coordinates, and hours shown in this web application are fictional sample data for classroom demonstration. They are not real recycling centers.
      </span>
    </div>
  );
};
