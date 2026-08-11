import React, { useState, useEffect } from 'react';
import { MiseEnPage } from '../composants/Disposition/MiseEnPage';
import { clientApi } from '../api/clientApi';
import { Package, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Bouton } from '../composants/Commun/Bouton';
// 1. IMPORTS RECHARTS POUR CIRCULAIRE ET HISTOGRAMME
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../styles/TableauBord.css';

export default function TableauBord() {
  const [produits, setProduits] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  
  // États existants
  const [entrepotAuditId, setEntrepotAuditId] = useState(null);
  const [auditResultat, setAuditResultat] = useState(null);
  const [auditEnCours, setAuditEnCours] = useState(false);

  // ÉTAT POUR LE PRODUIT SÉLECTIONNÉ AU CLIC
  const [produitSelectionne, setProduitSelectionne] = useState(null);

  const chargerDonnees = async () => {
    setChargement(true);
    setErreur('');
    try {
      const [dataProduits, dataEntrepots] = await Promise.all([
        clientApi.getProduits(),
        clientApi.getEntrepots()
      ]);
      setProduits(dataProduits);
      setEntrepots(dataEntrepots);
    } catch (err) {
      setErreur("Une erreur s'est produite lors de la récupération des données.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  // Calcul des statistiques pour les KPIs et le diagramme circulaire
  const totalReferences = produits.length;
  const quantiteTotale = produits.reduce((acc, p) => acc + p.quantite, 0);
  
  const dispoCount = produits.filter(p => p.status === 'disponible').length;
  const reserveCount = produits.filter(p => p.status === 'reserve').length;
  const perimeCount = produits.filter(p => p.status === 'perime').length;

  // 2. DONNÉES DU DIAGRAMME CIRCULAIRE (Répartition par statut)
  const donneesGlobalesStatut = [
    { name: 'Disponibles', value: dispoCount, color: '#48bb78' }, // Vert
    { name: 'Réservés', value: reserveCount, color: '#ecc94b' },   // Jaune/Orange
    { name: 'Périmés', value: perimeCount, color: '#f56565' },     // Rouge
  ];

  // 3. DONNÉES DE L'HISTOGRAMME (S'adapte dynamiquement si un produit est cliqué)
  // Si aucun produit n'est sélectionné, on montre tous les produits. Sinon, uniquement le produit cliqué.
  const donneesHistogramme = produitSelectionne 
    ? [produitSelectionne] 
    : produits;

  if (chargement) {
    return (
      <MiseEnPage titre="Tableau de Bord">
        <div className="chargement-conteneur">
          <div className="chargement-texte">
            <RefreshCw size={24} className="animate-spin" />
            Chargement des données...
          </div>
        </div>
      </MiseEnPage>
    );
  }

  return (
    <MiseEnPage titre="Tableau de Bord">
      {erreur && <div className="db-erreur-alerte">{erreur}</div>}

      {/* Grille de statistiques générales (RESTE FIXE EN HAUT) */}
      <div className="stats-grille">
        <div className="kpi-carte" onClick={() => setProduitSelectionne(null)} style={{ cursor: 'pointer' }}>
          <div className="kpi-icone-ronde kpi-vert"><Package size={20} /></div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{totalReferences}</span>
            <span className="kpi-label">Produits Enregistrés</span>
          </div>
        </div>

        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-gris"><RefreshCw size={20} /></div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{quantiteTotale}</span>
            <span className="kpi-label">Unités Totales</span>
          </div>
        </div>

        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-dispo"><CheckCircle size={20} /></div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{dispoCount}</span>
            <span className="kpi-label">Disponibles</span>
          </div>
        </div>

        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-reserve"><AlertTriangle size={20} /></div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{reserveCount}</span>
            <span className="kpi-label">Réservés</span>
          </div>
        </div>

        <div className="kpi-carte">
          <div className="kpi-icone-ronde kpi-perime"><XCircle size={20} /></div>
          <div className="kpi-textes">
            <span className="kpi-valeur">{perimeCount}</span>
            <span className="kpi-label">Périmés</span>
          </div>
        </div>
      </div>

      {/* 4. NOUVELLE SECTION UTILISANT FLEXBOX POUR COEXISTER CÔTE À CÔTE SANS TOUT DÉPLACER */}
      <div className="charts-container" style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        
        {/* BLOC DIAGRAMME CIRCULAIRE (Fixe : Répartition globale) */}
        <div style={{ flex: '1', minWidth: '300px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '15px', color: '#2d3748' }}>Répartition par statut</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donneesGlobalesStatut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} label>
                  {donneesGlobalesStatut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOC HISTOGRAMME (Dynamique : Filtre au clic) */}
        <div style={{ flex: '2', minWidth: '450px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
              {produitSelectionne ? `Focus Stock : ${produitSelectionne.nom}` : 'Comparatif des Volumes'}
            </h3>
            {produitSelectionne && (
              <Bouton onClick={() => setProduitSelectionne(null)} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                Voir tout
              </Bouton>
            )}
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donneesHistogramme} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nom" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantite" fill={produitSelectionne ? '#3182ce' : '#4a5568'} radius={[4, 4, 0, 0]} name="Quantité disponible" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

     

    </MiseEnPage>
  );
}
