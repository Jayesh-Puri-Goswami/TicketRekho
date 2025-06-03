import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import urls from '../../networking/app_urls';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

type SeatRow = {
  label: string; // Row label (e.g., A, B, C)
  seats: (number | '')[]; // Seats in the row, including spaces
  type: string; // Row type ('Recliner', 'Silver', 'Gold', 'Diamond')
  price: number;
};

const EventSeatx: React.FC = () => {
    const { id } = useParams();
  const [rows, setRows] = useState<SeatRow[]>(
    [
    // {
    //   label: 'A',
    //   seats: Array.from({ length: 10 }, (_, i) => i + 1),
    //   type: 'Recliner',
    //   price:100,
    // },
    // {
    //   label: 'B',
    //   seats: Array.from({ length: 8 }, (_, i) => i + 1),
    //   type: 'Silver',
    //   price:50,
    // },
  ]
);

  const [newRowSeats, setNewRowSeats] = useState<number>(10); // Default number of seats for a new row
  const [newRowType, setNewRowType] = useState<string>('Recliner'); // Default type for a new row
  const [price, setPrice] = useState<number>(0);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null); // Tracks the row being edited
  const [submittedLayout, setSubmittedLayout] = useState<SeatRow[] | null>(
    null,
  ); // Stores submitted layout
  // const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.user.currentUser?.data);
 
  useEffect(() => {

    const fetchSeatList = async () => {
      try {
        const response = await axios.get(`${urls.eventSeatLayoutForAdmin}?venueId=${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }); 
     
        setRows(response.data.data); 
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchSeatList();

  }, []);

 
  //console.log("submittedLayout",submittedLayout);

  const addRow = () => {
    if (newRowSeats <= 0 || isNaN(newRowSeats)) {
      toast.error('Please enter a valid number of seats greater than 0.');
      return;
    }
    if (price <= 0 || isNaN(price)) {
      toast.error('Please enter a valid price of seats greater than 0.');
      return;
    }

    if (newRowSeats >= 30) {
      toast.error('Limit Exceeded: You cannot add more than 30 seats in a single row.');
      return;
    }
    
    const newRow: SeatRow = {
      label: String.fromCharCode(65 + rows.length), // Generate row label (A, B, C, etc.)
      seats: Array.from({ length: newRowSeats }, (_, i) => i + 1),
      type: newRowType,
      price:price
    };
    const updatedRows = [...rows, newRow].map((row, index) => ({
      ...row,
      label: String.fromCharCode(65 + index),
    }));
    setRows(updatedRows);
    
    setNewRowSeats(10); // Reset inputs
    setNewRowType('Recliner');
  };

  const updateRow = () => {
    if (editingRowIndex === null) return;
    if (newRowSeats <= 0 || isNaN(newRowSeats)) {
      toast.error('Please enter a valid number of seats greater than 0.');
      return;
    }

    if (price <= 0 || isNaN(price)) {
      toast.error('Please enter a valid price of seats greater than 0.');
      return;
    }

    if (newRowSeats >= 30) {
      toast.error('Limit Exceeded: You cannot add more than 30 seats in a single row.');
      return;
    }

    const updatedRows = [...rows];
    const row = updatedRows[editingRowIndex];
    row.seats = Array.from({ length: newRowSeats }, (_, i) => i + 1); // Update seats
    row.type = newRowType; // Update type
    row.price = price; 

    setRows(updatedRows);
    setEditingRowIndex(null); // Exit editing mode
    setNewRowSeats(10); // Reset inputs
    setNewRowType('Recliner');
  };

  const removeRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, index) => index !== rowIndex).map((row, index) => ({
      ...row,
      label: String.fromCharCode(65 + index),
    }));
    setRows(updatedRows);
  };

  const addSpaceAtSeat = (rowIndex: number, seatIndex: number) => {
    const updatedRows = [...rows];
    const row = updatedRows[rowIndex];
    row.seats.splice(seatIndex, 0, ''); // Insert an empty space
    setRows(updatedRows);
  };

  const removeSpaceAtSeat = (rowIndex: number, seatIndex: number) => {
    const updatedRows = [...rows];
    const row = updatedRows[rowIndex];
    row.seats.splice(seatIndex, 1); // Remove the space
    setRows(updatedRows);
  };

  const startEditingRow = (rowIndex: number) => {
    const row = rows[rowIndex];
    setEditingRowIndex(rowIndex);
    setNewRowSeats(row.seats.length); // Set inputs for editing
    setNewRowType(row.type);
    setPrice(row.price);
  };

  const submitLayout = async () => {

    if (rows.length <= 0 ) {
      toast.error('Please add seat layout.');
      return;
    }

    setSubmittedLayout(rows);

    try {
     
      let formData = {
        data:rows,
        venueId:id,
      
      }
      console.log("formData",formData);

       await axios.post(
        `${urls.addEventSeatLayout}`, // Replace with your actual API endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`, // Add the user token if required
            'Content-Type': 'application/json',
          },
        },
      ).then((response) => {
        if (
          response.data.status &&
          response.data.data
        )
        {
          toast.success(
            'Seat layout added successfully!',
          );
        }

      })
      .catch((error) => {
        console.error('API Error:', error.response?.data || error.message);
      toast.error(
        error.response?.data?.message 
      );
    
      });
         
    } finally {
     
    }


  };

  const renderSeats = () => {
    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="mb-6">
        <div className="flex items-center mb-2">
          <span className="font-medium text-lg mr-4">
            {row.label} ({row.type})
          </span>
          <button
            onClick={() => startEditingRow(rowIndex)}
            className="px-2 py-1 bg-yellow-500 text-white rounded text-sm mr-2"
          >
            Edit
          </button>
          <button
            onClick={() => removeRow(rowIndex)}
            className="px-2 py-1 bg-red-500 text-white rounded text-sm"
          >
            Remove
          </button>
        </div>
        <div className="flex justify-center gap-2">
          {row.seats.map((seat, seatIndex) =>
            seat === '' ? (
              <button
                key={seatIndex}
                className="w-10 h-10 bg-red-200 border border-red-400 rounded"
                onClick={() => removeSpaceAtSeat(rowIndex, seatIndex)}
                title="Click to remove space"
              >
                X
              </button>
            ) : (
              <button
                key={seatIndex}
                className="w-10 h-10 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition-all"
                onClick={() => addSpaceAtSeat(rowIndex, seatIndex)}
                title="Click to add space"
              >
                {seat}
              </button>
            ),
          )}
        </div>
      </div>
    ));
  };

  const renderSubmittedLayout = () => {
    return submittedLayout?.map((row, rowIndex) => (
      <div key={rowIndex} className="mb-6">
        <div className="flex items-center mb-2">
          <span className="font-medium text-lg">
            {row.label} ({row.type})
          </span>
        </div>
        <div className="flex justify-center gap-2">
          {row.seats.map((seat, seatIndex) =>
            seat === '' ? (
              <div
                key={seatIndex}
                className="w-10 h-10 bg-gray-300 border border-gray-400 rounded"
                title="Space"
              ></div>
            ) : (
              <div
                key={seatIndex}
                className="w-10 h-10 border border-green-500 text-center flex items-center justify-center rounded"
              >
                {seat}
              </div>
            ),
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="p-5">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
      <div className="flex items-center gap-2">
        <label >Seats Per Row:</label>
        <input
          type="number"
          value={newRowSeats}
          min={0}
          onChange={(e) => setNewRowSeats(parseInt(e.target.value, 10))}
          className="px-3 py-2 border rounded w-20"
          placeholder="Seats"
        />
        </div>
        <div className="flex items-center gap-2">
        <label>Price:</label>
       <input
          type="number"
          value={price}
          min={0}
          onChange={(e) => setPrice(parseInt(e.target.value, 0))}
          className="px-3 py-2 border rounded w-20"
          placeholder="Price"
        />
        </div>
        <div className="flex items-center gap-2">
       <label>Seat Type:</label>
        <select
          value={newRowType}
          onChange={(e) => setNewRowType(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="Recliner">Recliner</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
          <option value="Diamond">Diamond</option>
        </select>
        </div>
        {editingRowIndex === null ? (
          <button
            onClick={addRow}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Row
          </button>
        ) : (
          <button
            onClick={updateRow}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Update Row
          </button>
        )}
      </div>

      <div className="bg-gray-100 p-5 rounded shadow-lg">{renderSeats()}</div>

      <div className="mt-6">
        <button
          onClick={submitLayout}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit Layout
        </button>
      </div>

      {submittedLayout && (
        <div className="mt-6 bg-gray-100 p-5 rounded shadow-lg">
          <h3 className="font-bold text-lg mb-4">Submitted Layout:</h3>
          {renderSubmittedLayout()}
        </div>
      )}
    </div>
  );
};

export default EventSeatx;
