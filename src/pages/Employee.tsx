import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import EmployeeTable from '../components/Tables/EmployeeTable';
import MultiSelect from '../components/Forms/MultiSelect';
import { useSelector } from 'react-redux';

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

  const currentUser = useSelector((state: any) => state.user.currentUser?.data);

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

  if (currentUser.role === 'admin') {
    return (
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Employees" />
        <EmployeeTable />
      </div>
    );
  }

  if (currentUser.role === 'theaterManager') {
    return (
      <div className='' >
        
      </div>
    )
  } 

  return (
      <div className='' >
        
      </div>
    )
};

export default Employee;
