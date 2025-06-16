import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Navbar from './components/Navbar/Navbar';
import MainPage from './components/MainPage/MainPage';
import DetailsPage from './components/DetailsPage/DetailsPage';
import SearchPage from './components/SearchPage/SearchPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Home / Product List */}
        <Route path="/" element={<MainPage />} />
        <Route path="/app" element={<MainPage />} />

        {/* Product Details */}
        <Route path="/app/product/:productId" element={<DetailsPage />} />

        {/* Search */}
        <Route path="/app/search" element={<SearchPage />} />

        {/* Auth Pages */}
        <Route path="/app/login" element={<LoginPage />} />
        <Route path="/app/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
