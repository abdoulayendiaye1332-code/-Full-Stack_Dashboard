import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, X } from 'lucide-react';
import '../../styles/Disposition.css';

/**
 * Barre de navigation latérale de l'application réactive et standard.
 * Utilise des classes CSS standards.
 */
export const BarreLaterale = ({ $ouverte, surFermeture }) => {
  return (
    <aside className={`sidebar ${$ouverte ? 'sidebar-ouverte' : ''}`}>
      <div className="sidebar-entete">
        <div className="sidebar-logo-conteneur">
          <h1 className="sidebar-app-nom">Eco-Stock</h1>
        </div>
        
        <button 
          onClick={surFermeture} 
          className="sidebar-bouton-fermer"
          aria-label="Fermer le menu"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" end onClick={surFermeture} className="sidebar-lien">
          <LayoutDashboard size={18} />
          Tableau de Bord
        </NavLink>
        
        <NavLink to="/produits" onClick={surFermeture} className="sidebar-lien">
          <Package size={18} />
          Produits
        </NavLink>
        
        <NavLink to="/entrepots" onClick={surFermeture} className="sidebar-lien">
          <Warehouse size={18} />
          Entrepôts
        </NavLink>
      </nav>
    </aside>
  );
};
