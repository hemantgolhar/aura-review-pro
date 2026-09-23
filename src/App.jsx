import React from 'react';
import SuperAdmin from './pages/SuperAdmin.jsx';
import RestaurantAdmin from './pages/RestaurantAdmin.jsx';
import CustomerPage from './pages/CustomerPage.jsx';

const pages = {
  '/': CustomerPage,
  '/super-admin': SuperAdmin,
  '/admin': RestaurantAdmin,
  '/r/demo': CustomerPage,
};

export default function App() {
  const pathname = window.location.pathname.slice(import.meta.env.BASE_URL.length - 1).replace(/\/$/, '') || '/';
  const Page = pages[pathname];

  return Page ? <Page /> : <main className="page"><h1>Page not found</h1></main>;
}
