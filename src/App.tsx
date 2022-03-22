
import React from 'react';

import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';

import { Home } from '@autonomy-station/pages/Home';
import { Manage } from '@autonomy-station/pages/Manage';
import { WalletProvider } from '@autonomy-station/hooks/use-wallet';
import { NetworkSelector } from '@autonomy-station/components/NetworkSelector';


function App() {

  return (
    <WalletProvider>
      <BrowserRouter>

        <nav className="absolute top-0 left-0 flex flex-row">
          <Link to="/" className="font-semibold text-autonomyAcent500 hover:bg-autonomyPrimary200 hover:text-autonomyPrimary500 px-4 py-2">Home</Link>
          <Link to="/manage" className="font-semibold text-autonomyAcent500 hover:bg-autonomyPrimary200 hover:text-autonomyPrimary500 px-4 py-2">Manage</Link>
        </nav>

        <div className="fixed top-1 right-4">
          <NetworkSelector />
        </div>
      
        <Routes>
          <Route path="/manage" element={<Manage/>} />
          <Route path="/" element={<Home/>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

      </BrowserRouter>

      <div id="modal-container" className="fixed top-0 left-0 z-10 w-full h-full pointer-events-none" ></div>
    </WalletProvider>
  );
}

export default App;
