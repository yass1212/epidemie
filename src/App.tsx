import { useState, useEffect } from 'react'
import './App.css'

function App() {


  // gestion de la simulation
    const [simulationTourne, setSimulationTourne] = useState(false);  


  // type d'étatHumain défini par un nom et une couleur
  type EtatHumain = {
    nom: string;
    couleur: string;
  };


  // états possible avec leur couleur : un enregistrement contenant un nom et un état humain
  const [etat] = useState<Record<string, EtatHumain>>({
    mort: { nom: 'Mort', couleur: '#3A3A3A' },          // mort : noir
    sain: { nom: 'Sain', couleur: '#45c489' },          // sain : vert
    immunise: { nom: 'Immunisé', couleur: '#7AA2FF' },  // immunisé : bleu
    malade: { nom: 'Malade', couleur: '#e36666' }       // malade : rouge
  });



  // Humain qui possède un état
  class Humain {
    etat: EtatHumain;
    constructor(etat: EtatHumain) {
      this.etat = etat;
    }
  }


  // nombre d'Humains dans la population
  const [nbrHumainsPopulation, setNbrHumainsPopulation] = useState(40);

  // la population d'Humains
  const [population, setPopulation] = useState<Humain[][]>([]);

  // initialiser la population
  useEffect(() => {
    setPopulation(genererPopulation(nbrHumainsPopulation));
  }, [nbrHumainsPopulation]);
  
  

  








  // générer une population de d'Humains
  function genererPopulation(nbrPopulation: number): Humain[][] {
    // pour afficher la population dans un rectangle en 16/9
    const lignes = Math.ceil(Math.sqrt((nbrPopulation * 9) / 16));
    const colonnes = Math.ceil(Math.sqrt((nbrPopulation * 16) / 9));

    // tableau
    const tabPopulation: Humain[][] = [];

    //compteur d'Humains ajoutés
    let compteur = 0;

    // tableau avec Humains sains au début
    for (let i = 0; i < lignes; i++) {
      const ligne: Humain[] = [];
      for (let j = 0; j < colonnes && compteur < nbrPopulation; j++) {
        const humain = new Humain(etat.sain);
        ligne.push(humain);
        compteur++;
      }
      if (ligne.length > 0) {
        tabPopulation.push(ligne);
      }
    }

    // 1 malade de départ
    const ligneHasard = Math.floor(Math.random() * tabPopulation.length);
    const colonneHasard = Math.floor(Math.random() * tabPopulation[ligneHasard].length);
    tabPopulation[ligneHasard][colonneHasard].etat = etat.malade;

    return tabPopulation;
  }














  // calculer voisins
  const getVoisins = (ligne: number, col: number): Humain[] => {
    const voisins: Humain[] = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newLigne = ligne + i;
        const newCol = col + j;
        if (newLigne >= 0 && newLigne < population.length && newCol >= 0 && newCol < population[newLigne].length) {
          voisins.push(population[newLigne][newCol]);
        }
      }
    }
    return voisins;
  };



  // les 2 probabilités
  const [p1, setP1] = useState(0.4);
  const [p2, setP2] = useState(0.8);




  // appliquer les règles de la simulation
  const appliquerRegles = () => {
    const nouvellePopulation: Humain[][] = [];
    for (let i = 0; i < population.length; i++) {
      const nouvelleLigne: Humain[] = [];
      for (let j = 0; j < population[i].length; j++) {
        const humain = population[i][j];
        // récupérer les voisins
        const voisins = getVoisins(i, j);
        // récupérer le nombre de voisins malades
        const voisinsMalades = voisins.filter((v) => v.etat === etat.malade).length;

        // rester mort
        if (humain.etat === etat.mort) {
          nouvelleLigne.push(new Humain(etat.mort));

        // rester immunisé
        } else if (humain.etat === etat.immunise) {
          nouvelleLigne.push(new Humain(etat.immunise));

        // malade
        } else if (humain.etat === etat.malade) {
          const probabilite = Math.random();

          if (probabilite < p1) {
            nouvelleLigne.push(new Humain(etat.mort));
          } else {
            nouvelleLigne.push(new Humain(etat.immunise));
          }

        // sain
        } else if (humain.etat === etat.sain && voisinsMalades > 0) {
          
          const probabilite = Math.random();
          if (probabilite < p2) {
            nouvelleLigne.push(new Humain(etat.malade));
          } else {
            nouvelleLigne.push(new Humain(etat.sain));
          }

        } else {
          nouvelleLigne.push(new Humain(etat.sain));
        }
      }
      nouvellePopulation.push(nouvelleLigne);
    }
    setPopulation(nouvellePopulation);
  };
  // appliquer les règles toutes les 0.6 secondes
  useEffect(() => {
    if (!simulationTourne || population.length === 0) return;
    
    const intervalle = setInterval(() => {
      appliquerRegles();
    }, 600);
    
    return () => clearInterval(intervalle);
  }, [population, simulationTourne]);

    



  // plus de malade = afficher message et arreter la simuatlion
  useEffect(() => {
    if (!population.some(ligne => ligne.some(human => human.etat === etat.malade))) {
      setSimulationTourne(false);
      const message = document.createElement('div');
      message.textContent = "La simulation est terminée, il n'y a plus de malade !";
      message.style.position = 'fixed';
      message.style.top = '50%';
      message.style.left = '50%';
      message.style.transform = 'translate(-50%, -50%)';
      message.style.backgroundColor = '#333';
      message.style.color = 'white';
      message.style.padding = '20px';
      message.style.borderRadius = '5px';
      message.style.zIndex = '1000';
      document.body.appendChild(message);
      setTimeout(() => document.body.removeChild(message), 3000);
    }
  }, [population, simulationTourne]);








  
  

  
  // afficher la population
  const AfficherPopulation = () => {
    return (
      <table className="contour" style={{ margin: '0 auto' }}>
        <tbody>
          {population.map((ligne, ligneIndex) => (
            <tr key={ligneIndex}>
              {ligne.map((humain, colIndex) => (
                <td
                  key={`${ligneIndex}-${colIndex}`}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: humain.etat.couleur,
                    borderRadius: '20%',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }




  // affichage de la légende
  const Legende = () => {
    // style
    const styleCellule = {
      width: '20px',
      height: '20px',
      borderRadius: '20%',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    };


    const legendeEtats = Object.values(etat).map((etat, index) => (
      <tr key={index}>
        <td 
          style={{
            ...styleCellule,
            backgroundColor: etat.couleur,
          }}
        />
        <td style={{textAlign: 'left', paddingLeft: '10px'}} >{etat.nom}</td>
      </tr>
    ));

    return (
      <div className="contour">
        <h3>Légende</h3>
        <table style={{ margin: '0 auto' }}>
          <tbody>
            {legendeEtats}
          </tbody>
        </table>
      </div>
    );
  };





   // Fonction pour gérer le changement de valeur du slider
   const changementPopulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setNbrHumainsPopulation(value); // Mettre à jour l'état
    setPopulation(genererPopulation(value)); // Appeler la fonction pour générer la population

    // stopper la simulation
    setSimulationTourne(false);
  };





// RETURN //////////////////////////////////////////////////////////////////////////////////////////

  return (
    <>
      <h1>Simulation d'une épidémie</h1>

      {/* paramétrage */}
      <div className="contour2" style={{ margin: '0 auto' }}>

        <h2>Paramétrage</h2>

        <label htmlFor="nbrPopulationRange">Nombre d'humains dans la population : </label>
        <span style={{ fontWeight: 'bold' }}>{nbrHumainsPopulation}</span> {/* Afficher la valeur actuelle du slider */}
        <br></br>
        <input
          className="slider"
          onChange={changementPopulation} // Utiliser la fonction de gestion du changement
          type="range"
          min="1"
          max="1000"
          value={nbrHumainsPopulation} // Lier la valeur du slider à l'état
          id="nbrPopulationRange"
        />

        <br />


        <h3>Probabilités</h3>
        <p>La simulation se fait tour par tour, à chaque tour les états des humains sont recalculés selon les probabilités suivantes :</p>

        <label htmlFor="p1">Un malade mourra (létalité) sinon il sera immunisé : </label>
        <span style={{ fontWeight: 'bold' }}>{p1}</span> {/* Afficher la valeur actuelle du slider */}
        <br></br>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={p1}
          id="p1"
          onChange={(e) => setP1(parseFloat(e.target.value))}
        />


        <br />


        <label htmlFor="p2">Une personne saine sera malade (à condition qu'elle soit à côté d'un malade) : </label>
        <span style={{ fontWeight: 'bold' }}>{p2}</span> {/* Afficher la valeur actuelle du slider */}
        <br></br>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={p2}
          id="p2"
          onChange={(e) => setP2(parseFloat(e.target.value))}
        />
      </div>

      < Legende />

      {/* boutons */}
      <button 
        onClick={() => setSimulationTourne(!simulationTourne)}
        style={{ marginTop: '10px', marginLeft:'10px' }}
      >
        {simulationTourne ? 'Pause' : 'Commencer/Reprendre'}
      </button>

      <button
        style={{ marginTop: '10px', marginLeft:'10px' }}
        onClick={() => {
          setSimulationTourne(false);
          setPopulation(genererPopulation(nbrHumainsPopulation));
        }}
      >
        Recommencer
      </button>


      < AfficherPopulation />
      
    </>
  )
}

export default App
