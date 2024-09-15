import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Barcode, Banknote, Repeat, BarChart2, X, Calendar, Menu } from 'lucide-react';

const EpargneDigitaleUI = () => {
  const [epargneAuto, setEpargneAuto] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [montant, setMontant] = useState('');
  const [dureeEpargne, setDureeEpargne] = useState(30);
  const [objectifs, setObjectifs] = useState([]);
  const [nouvelObjectif, setNouvelObjectif] = useState({ nom: '', montantCible: '' });
  const [objectifSelectionne, setObjectifSelectionne] = useState(null);
  const [objectifPourDepot, setObjectifPourDepot] = useState(null);
  const [menuOuvert, setMenuOuvert] = useState(false);

  const soldeTotal = useMemo(() => objectifs.reduce((total, obj) => total + obj.soldeActuel, 0), [objectifs]);

  const handleDeposit = () => {
    if (montant && !isNaN(montant) && objectifPourDepot) {
      setObjectifs(prevObjectifs => prevObjectifs.map(obj => 
        obj.id === objectifPourDepot 
          ? { ...obj, soldeActuel: obj.soldeActuel + parseInt(montant) }
          : obj
      ));
      setShowModal(null);
      setMontant('');
    }
  };

  const handleWithdraw = () => {
    if (montant && !isNaN(montant) && objectifPourDepot) {
      setObjectifs(prevObjectifs => prevObjectifs.map(obj => 
        obj.id === objectifPourDepot && obj.soldeActuel >= parseInt(montant)
          ? { ...obj, soldeActuel: obj.soldeActuel - parseInt(montant) }
          : obj
      ));
      setShowModal(null);
      setMontant('');
    }
  };

  const toggleEpargneAuto = () => {
    setEpargneAuto(!epargneAuto);
  };

  const handleDureeChange = (e) => {
    setDureeEpargne(parseInt(e.target.value));
  };

  const handleNouvelObjectifChange = (e) => {
    const { name, value } = e.target;
    setNouvelObjectif(prev => ({ ...prev, [name]: value }));
  };

  const ajouterNouvelObjectif = () => {
    if (nouvelObjectif.nom && nouvelObjectif.montantCible) {
      const newObjectif = {
        id: objectifs.length + 1,
        nom: nouvelObjectif.nom,
        montantCible: parseInt(nouvelObjectif.montantCible),
        soldeActuel: 0
      };
      setObjectifs(prev => [...prev, newObjectif]);
      setNouvelObjectif({ nom: '', montantCible: '' });
      if (objectifs.length === 0) {
        setObjectifSelectionne(newObjectif.id);
        setObjectifPourDepot(newObjectif.id);
      }
    }
  };

  const calculerProgres = (objectif) => {
    return Math.round((objectif.soldeActuel / objectif.montantCible) * 100);
  };

  const Modal = ({ title, onClose, onSubmit }) => {
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose}><X size={24} /></button>
          </div>
          <select 
            value={objectifPourDepot || ''}
            onChange={(e) => setObjectifPourDepot(parseInt(e.target.value))}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="">Sélectionner un objectif</option>
            {objectifs.map(obj => (
              <option key={obj.id} value={obj.id}>{obj.nom} - Solde: {obj.soldeActuel} FCFA</option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            placeholder="Montant"
          />
          <button onClick={onSubmit} className="w-full bg-blue-500 text-white p-2 rounded">
            Confirmer
          </button>
        </div>
      </div>
    );
  };

  const MenuLateral = () => (
    <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${menuOuvert ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={() => setMenuOuvert(false)} className="p-1">
            <X size={24} />
          </button>
        </div>
        <ul>
          <li className="mb-2"><button className="text-left w-full">Tableau de bord</button></li>
          <li className="mb-2"><button className="text-left w-full">Historique des transactions</button></li>
          <li className="mb-2"><button className="text-left w-full">Paramètres d'épargne automatique</button></li>
          <li className="mb-2"><button className="text-left w-full">Notifications</button></li>
          <li className="mb-2"><button className="text-left w-full">Aide et support</button></li>
          <li className="mb-2"><button className="text-left w-full">Profil utilisateur</button></li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-100 max-w-md mx-auto rounded-lg shadow-md relative">
      <button 
        onClick={() => setMenuOuvert(!menuOuvert)} 
        className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full"
      >
        <Menu size={24} />
      </button>

      <h1 className="text-2xl font-bold mb-4 text-center">Mon Épargne</h1>
      
      <div className="bg-white p-4 rounded-lg mb-4">
        <p className="text-lg font-semibold">Solde total</p>
        <p className="text-3xl font-bold text-green-600">{soldeTotal} FCFA</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button onClick={() => setShowModal('deposit')} className="flex flex-col items-center justify-center p-4 bg-green-800 text-white rounded-lg">
          <Banknote size={24} />
          <span>Déposer</span>
        </button>
        <button onClick={() => setShowModal('withdraw')} className="flex flex-col items-center justify-center p-4 bg-red-900 text-white rounded-lg">
          <Barcode size={24} />
          <span>Retirer</span>
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Mes objectifs</h2>
        {objectifs.length > 0 ? (
          <>
            <select 
              value={objectifSelectionne || ''}
              onChange={(e) => setObjectifSelectionne(parseInt(e.target.value))}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Sélectionner un objectif</option>
              {objectifs.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.nom} - Cible: {obj.montantCible} FCFA</option>
              ))}
            </select>
            {objectifSelectionne && objectifs.find(obj => obj.id === objectifSelectionne) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{objectifs.find(obj => obj.id === objectifSelectionne).nom}</span>
                  <span className="font-semibold">{calculerProgres(objectifs.find(obj => obj.id === objectifSelectionne))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{width: `${calculerProgres(objectifs.find(obj => obj.id === objectifSelectionne))}%`}}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {objectifs.find(obj => obj.id === objectifSelectionne).soldeActuel} / {objectifs.find(obj => obj.id === objectifSelectionne).montantCible} FCFA
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-600">Aucun objectif ajouté. Commencez par ajouter un objectif ci-dessous.</p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Ajouter un nouvel objectif</h2>
        <input
          type="text"
          name="nom"
          value={nouvelObjectif.nom}
          onChange={handleNouvelObjectifChange}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Nom de l'objectif"
        />
        <input
          type="number"
          name="montantCible"
          value={nouvelObjectif.montantCible}
          onChange={handleNouvelObjectifChange}
          className="w-full p-2 mb-2 border rounded"
          placeholder="Montant cible de l'objectif"
        />
        <button 
          onClick={ajouterNouvelObjectif}
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Ajouter l'objectif
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Durée d'épargne</h2>
        <div className="flex items-center">
          <Calendar size={24} className="mr-2 text-blue-500" />
          <input
            type="number"
            value={dureeEpargne}
            onChange={handleDureeChange}
            className="w-20 p-2 border rounded mr-2"
            min="1"
          />
          <span>jours</span>
        </div>
      </div>
      
      <div className="flex justify-around mb-4">
        <button onClick={toggleEpargneAuto} className={`flex flex-col items-center ${epargneAuto ? 'text-blue-600' : 'text-gray-600'}`}>
          <Repeat size={24} />
          <span>Automatique</span>
        </button>
        <button onClick={() => setShowStats(!showStats)} className={`flex flex-col items-center ${showStats ? 'text-blue-600' : 'text-gray-600'}`}>
          <BarChart2 size={24} />
          <span>Statistiques</span>
        </button>
      </div>

      {showModal === 'deposit' && (
        <Modal title="Déposer" onClose={() => setShowModal(null)} onSubmit={handleDeposit} />
      )}
      {showModal === 'withdraw' && (
        <Modal title="Retirer" onClose={() => setShowModal(null)} onSubmit={handleWithdraw} />
      )}

      {showStats && (
        <div className="mt-4 bg-white p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Statistiques</h3>
          <p>Épargne totale : {soldeTotal} FCFA</p>
          <p>Épargne moyenne : {Math.round(soldeTotal / dureeEpargne)} FCFA/jour</p>
          <p>Objectifs atteints : {objectifs.filter(obj => obj.soldeActuel >= obj.montantCible).length} / {objectifs.length}</p>
          <p>Durée d'épargne : {dureeEpargne} jours</p>
          <p>Projection : {Math.round(soldeTotal / dureeEpargne * 30)} FCFA/mois</p>
        </div>
      )}

      <MenuLateral />
    </div>
  );
};

export default () => <EpargneDigitaleUI />;
