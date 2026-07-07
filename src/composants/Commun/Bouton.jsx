import React from 'react';
import '../../styles/Composants.css';

/**
 * Composant de Bouton réutilisable répondant au principe de responsabilité unique (SRP).
 * Utilise des classes CSS standards et fusionne les classes supplémentaires.
 */
export const Bouton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variante = 'primaire', 
  pleineLargeur = false, 
  disabled = false,
  className = '',
  style,
  ...props 
}) => {
  // Fusionne les classes par défaut de la variante avec l'éventuelle classe personnalisée
  const nomClasse = `btn btn-${variante} ${pleineLargeur ? 'btn-pleine-largeur' : ''} ${className}`.trim();

  return (
    <button
      type={type}
      className={nomClasse}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};
