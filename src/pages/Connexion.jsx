import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/ContexteAuth';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Bouton } from '../composants/Commun/Bouton';
import { Entree } from '../composants/Commun/Entree';
import '../styles/Connexion.css';

/**
 * Page de connexion de l'application Eco-Stock.
 * Utilise des classes CSS standards issues de Connexion.css.
 */
export default function Connexion() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const gererSoumission = async (evenement) => {
    evenement.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      await connexion(identifiant, motDePasse);
      navigate('/'); // Redirection vers le tableau de bord
    } catch (err) {
      setErreur(err.message || 'Impossible de se connecter. Vérifiez vos identifiants.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="connexion-page">
      {/* Côté gauche : Formulaire de connexion */}
      <div className="zone-formulaire">
        <div className="connexion-cadre">
          <div className="connexion-logo">
            <h1 className="connexion-titre">Eco-Stock</h1>
            <p className="connexion-soustitre">
              Veuillez vous identifier pour accéder à votre espace de gestion.
            </p>
          </div>

          {erreur && (
            <div className="connexion-erreur-alerte">
              <AlertCircle size={16} />
              <span>{erreur}</span>
            </div>
          )}

          <form className="connexion-form" onSubmit={gererSoumission}>
            <Entree
              label="Adresse Email ou username"
              icone={Mail}
              placeholder="nom@entreprise.com"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              required
            />

            <div>
              <div className="connexion-mdp-entete">
                <label className="champ-label">
                  Mot de passe
                </label>
              
              </div>
              <Entree
                icone={Lock}
                type="password"
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>

            <Bouton 
              type="submit" 
              variante="primaire" 
              pleineLargeur 
              disabled={chargement}
              className="btn-connexion"
            >
              {chargement ? 'Connexion...' : 'Se connecter'}
            </Bouton>
          </form>

    
        </div>
      </div>

  
    </div>
  );
}
