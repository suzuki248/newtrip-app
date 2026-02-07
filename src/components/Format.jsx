// src/components/Format.jsx
/**
 * Layout Component
 * Provides the main navigation structure for the application.
 * Renders the navigation bar and the Outlet for child routes.
 */
import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

function Format() {
  return (
    <div translate="no" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderBottom: '1px solid #dee2e6',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div className="container flex justify-between items-center" style={{ padding: '0', maxWidth: '800px', margin: '0 auto' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            Trip Planner
          </Link>
          <ul className="flex gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <NavLink
                to="/"
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary-color)' : 'var(--dark-color)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  padding: '0.5rem'
                })}
              >
                ホーム
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/create-plan"
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary-color)' : 'var(--dark-color)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  padding: '0.5rem'
                })}
              >
                プラン作成
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

      {/* Footer Area */}
      <footer className="footer no-print">
        <div className="container" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
            &copy; 2026 Trip Planner. AIを活用した旅行プラン作成ツール
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Format;
