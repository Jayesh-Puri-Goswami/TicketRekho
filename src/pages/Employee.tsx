import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import EmployeeTable from '../components/Tables/EmployeeTable';
import MultiSelect from '../components/Forms/MultiSelect';

interface Theatre {
  id: number;
  name: string;
  location: string;
  contact: string;
  screenConfig: { size: string; screenType: string };
  seatingConfig: { capacity: number; layout: string };
}

const Employee: React.FC = () => {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [currentTheatre, setCurrentTheatre] = useState<Partial<Theatre>>({});

  const addTheatre = () => {
    if (
      currentTheatre.name &&
      currentTheatre.location &&
      currentTheatre.contact
    ) {
      const newTheatre: Theatre = {
        id: theatres.length + 1,
        name: currentTheatre.name,
        location: currentTheatre.location,
        contact: currentTheatre.contact,
        screenConfig: currentTheatre.screenConfig!,
        seatingConfig: currentTheatre.seatingConfig!,
      };
      setTheatres([...theatres, newTheatre]);
      setCurrentTheatre({});
    }
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Employees"/>
      <EmployeeTable />
    </div>
  );
};

export default Employee;


