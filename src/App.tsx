
import React from 'react';

import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom';

import { Home } from '@autonomy-station/pages/Home';
import { Manage } from '@autonomy-station/pages/Manage';
import { WalletProvider } from '@autonomy-station/hooks/use-wallet';
import { NetworkSelector } from '@autonomy-station/components/NetworkSelector';
import autonomyLogo from '@autonomy-station/autonomyLogo.png'


function App() {

  return (
    <WalletProvider>
      <BrowserRouter>
        <nav className="absolute items-center flex flex-row mt-8 ml-4">
          <Link to="/" className="font-semibold text-2xl rounded-lg text-autonomyBlack bg-gradient-to-r from-autonomyAcent500 to-autonomySecondary500 hover:from-pink-400 hover:to-autonomyAcent500 px-8 py-4">Station</Link>
          <Link to="/manage" className="font-semibold text-2xl ml-2 rounded-lg text-autonomyBlack bg-gradient-to-r from-autonomyAcent500 to-autonomySecondary500 hover:from-pink-400 hover:to-autonomyAcent500 px-8 py-4">Manage</Link>
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
