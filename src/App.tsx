
import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Home } from '@autonomy-station/pages/Home';
import { WalletProvider } from '@autonomy-station/hooks/use-wallet';
import { NetworkSelector } from '@autonomy-station/components/NetworkSelector';


function App() {

  return (
    <WalletProvider>
      <BrowserRouter>

        <div className="fixed top-1 right-4">
          <NetworkSelector />
        </div>
      
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>

      </BrowserRouter>

      <div id="modal-container" className="fixed top-0 left-0 z-10 w-full h-full pointer-events-none" ></div>
    </WalletProvider>
  );
}

export default App;
