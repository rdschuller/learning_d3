import './App.css'
import BarChart from './components/BarChart';
import React from 'react';


function App() {
  return (
      <div className="bg-oxford">
          <h1 className='bg-veridian text- text-4xl font-rozha px-3'>Biggest Agricultural Products by Country</h1>
          <BarChart />
      </div>
  );
}


export default App
