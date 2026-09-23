import React from 'react';
import { demoRestaurant } from '../data.js';

export default function SuperAdmin() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>Super Admin</h1>
      </header>
      <article className="card">
        <h2 className="card-title">{demoRestaurant.name}</h2>
        <p>Status: <span className="status">{demoRestaurant.status}</span></p>
        <a className="button" href={`${import.meta.env.BASE_URL}admin/`}>Open Admin</a>
      </article>
    </main>
  );
}
