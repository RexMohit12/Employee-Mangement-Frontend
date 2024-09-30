import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    firstname: '',
    lastname: '',
    age: '',
    city: ''
  });
  const [editEmployee, setEditEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5); // Number of employees per page
  const [temperature, setTemperature] = useState({});

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage]);

  const fetchEmployees = async (page) => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees', {
        params: { page, limit }
      });
      setEmployees(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      fetchCityTemperatures(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchCityTemperatures = async (employees) => {
    const apiKey = "90f8bc083e39e2b11d1833cf2618224f"; // Replace with your OpenWeather API key
    const cityNames = employees.map(emp => emp.city).filter(city => city);
    const promises = cityNames.map(city => 
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    );

    try {
      const responses = await Promise.all(promises);
      const temperatures = {};
      responses.forEach(response => {
        const city = response.data.name;
        const temp = response.data.main.temp;
        temperatures[city] = temp;
      });
      setTemperature(temperatures);
    } catch (error) {
      console.error('Error fetching city temperatures:', error);
    }
  };

  const addEmployee = async () => {
    if (!newEmployee.firstname || !newEmployee.lastname || !newEmployee.age || !newEmployee.city) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/employees', newEmployee);
      setNewEmployee({ firstname: '', lastname: '', age: '', city: '' });
      fetchEmployees(currentPage);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const updateEmployee = async () => {
    if (!editEmployee.firstname || !editEmployee.lastname || !editEmployee.age || !editEmployee.city) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/employees/${editEmployee.id}`, editEmployee);
      setEditEmployee(null);
      fetchEmployees(currentPage);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      if (employees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchEmployees(currentPage);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchEmployees(currentPage);
    } else {
      try {
        const response = await axios.get('http://localhost:5000/api/employees/search', {
          params: { term: searchTerm }
        });
        setEmployees(response.data.data);
        setCurrentPage(1);
        setTotalPages(response.data.totalPages); // Update total pages based on search results
      } catch (error) {
        console.error('Error searching employees:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Employee Management</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by Name, ID or Age"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleSearch} style={{ backgroundColor: 'blue', color: 'white' }}>Search</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="First Name"
          value={newEmployee.firstname}
          onChange={(e) => setNewEmployee({ ...newEmployee, firstname: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newEmployee.lastname}
          onChange={(e) => setNewEmployee({ ...newEmployee, lastname: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="number"
          placeholder="Age"
          value={newEmployee.age}
          onChange={(e) => setNewEmployee({ ...newEmployee, age: e.target.value })}
          style={{ marginRight: '10px', width: '60px' }}
        />
        <input
          type="text"
          placeholder="City"
          value={newEmployee.city}
          onChange={(e) => setNewEmployee({ ...newEmployee, city: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <button onClick={addEmployee} style={{ backgroundColor: 'green', color: 'white' }}>Add Employee</button>
      </div>

      {editEmployee && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Edit Employee</h2>
          <input
            type="text"
            placeholder="First Name"
            value={editEmployee.firstname}
            onChange={(e) => setEditEmployee({ ...editEmployee, firstname: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={editEmployee.lastname}
            onChange={(e) => setEditEmployee({ ...editEmployee, lastname: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <input
            type="number"
            placeholder="Age"
            value={editEmployee.age}
            onChange={(e) => setEditEmployee({ ...editEmployee, age: e.target.value })}
            style={{ marginRight: '10px', width: '60px' }}
          />
          <input
            type="text"
            placeholder="City"
            value={editEmployee.city}
            onChange={(e) => setEditEmployee({ ...editEmployee, city: e.target.value })}
            style={{ marginRight: '10px' }}
          />
          <button onClick={updateEmployee} style={{ backgroundColor: 'orange', color: 'white' }}>Update Employee</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={tableHeaderStyle}>#</th>
            <th style={tableHeaderStyle}>First Name</th>
            <th style={tableHeaderStyle}>Last Name</th>
            <th style={tableHeaderStyle}>Age</th>
            <th style={tableHeaderStyle}>City</th>
            <th style={tableHeaderStyle}>Temperature (°C)</th>
            <th style={tableHeaderStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee, index) => (
              <tr key={employee.id} style={{ textAlign: 'center' }}>
                <td style={tableCellStyle}>{(currentPage - 1) * limit + index + 1}</td>
                <td style={tableCellStyle}>{employee.firstname}</td>
                <td style={tableCellStyle}>{employee.lastname}</td>
                <td style={tableCellStyle}>{employee.age}</td>
                <td style={tableCellStyle}>{employee.city}</td>
                <td style={tableCellStyle}>{temperature[employee.city] ? temperature[employee.city] : 'N/A'}</td>
                <td style={tableCellStyle}>
                  <button onClick={() => setEditEmployee(employee)} style={{ backgroundColor: 'yellow' }}>Edit</button>
                  <button onClick={() => deleteEmployee(employee.id)} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No employees found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} style={{ marginRight: '10px' }}>Previous</button>
        {getPageNumbers().map(page => (
          <button key={page} onClick={() => handlePageChange(page)} style={{ marginRight: '5px', backgroundColor: currentPage === page ? 'lightgray' : '' }}>{page}</button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} style={{ marginLeft: '10px' }}>Next</button>
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  border: '1px solid #dddddd',
  padding: '8px',
};

const tableCellStyle = {
  border: '1px solid #dddddd',
  padding: '8px',
};

export default EmployeeManagement;
