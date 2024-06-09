import React, { useState, useEffect } from 'react';
import styles from './style';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './firebaseConfig'; // Asegúrate de que esto apunta a tu archivo de configuración de Firebase

const RaffleGame = () => {

  //==================================Constantes Simples============================================================
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [winner, setWinner] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [password, setPassword] = useState('eureka');
  const [isAdmin, setIsAdmin] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  

// Y luego, en la función selectNumber, actualizas availableNumbers como se muestra arriba


  //====================================================================================

  useEffect(() => {
    const fetchParticipants = async () => {
      const snapshot = await getDocs(collection(db, "participants"));
      const participantsList = [];
      snapshot.forEach((doc) => {
        participantsList.push({ id: doc.id,...doc.data() });
      });
      setParticipants(participantsList);
    };

    fetchParticipants();

    setAvailableNumbers(Array.from({length: 100}, (_, i) => i + 1));
  }, []);

  const selectNumber = (number) => {
    if (!selectedNumbers.includes(number)) {
      setSelectedNumbers([...selectedNumbers, number]);
      // Paso 3: Actualizar availableNumbers al seleccionar un número
      setAvailableNumbers(availableNumbers.filter(n => n!== number));
    }
  };
  

  const deselectNumber = (number) => {
    setSelectedNumbers(selectedNumbers.filter(num => num!== number));
  };

  const checkIfNumberExists = async (number) => {
    const q = query(collection(db, "participants"), where("number", "==", number));
    const querySnapshot = await getDocs(q);
    return!querySnapshot.empty;
  };

  const saveParticipant = async () => {
    if (newParticipant.trim()) {
      const numberExists = await checkIfNumberExists(selectedNumbers[0]);
      if (numberExists) {
        alert('El número ya está asignado a otro participante. Por favor, elige otro número.');
      } else {
        await addDoc(collection(db, "participants"), {
          name: newParticipant,
          number: selectedNumbers[0]
        });
        setNewParticipant('');
        setSelectedNumbers([]);
      }
    }
  };
  
  

  // const addParticipant = async (number) => {
  //   if (newParticipant.trim()) {
  //     await addDoc(collection(db, "participants"), {
  //       name: newParticipant,
  //       number: number
  //     });
  //     setNewParticipant('');
  //   }
  // };

  const drawWinner = async () => {
    if (participants.length > 0) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winnerRef = doc(db, "participants", participants[randomIndex].id);
      await updateDoc(winnerRef, { isWinner: true });
      setWinner(participants[randomIndex]);
    }
  };

  const resetRaffle = async () => {
    const participantRefs = participants.map(async (participant) => {
      await deleteDoc(doc(db, "participants", participant.id));
    });
    await Promise.all(participantRefs);
    setParticipants([]);
    setWinner(null);
    setSelectedNumbers([]);
    setPassword('eurekae');
    setIsAdmin(false);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleAdminClick = () => {
    const enteredPassword = prompt('Por favor, introduce la contraseña:');
    if (enteredPassword === password) {
      setIsAdmin(true);
    } else {
      alert('Contraseña incorrecta. No tienes permiso para administrar.');
    }
  };

  return (
    <div className="container mx-auto p-4">
          <h1 className="flex-1 font-poppins font-semibold ss:text-[72px] text-[52px] text-white ss:leading-[100.8px] leading-[75px]">
          Sorteio<span className="text-gradient"> MORAL</span>{" "}
          </h1>
      <div className="mb-4">
        <input
          type="text"
          className="font-poppins shadow appearance-none border rounded-[20px] w-full py-2 mb-4 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="nombre" 
          value={newParticipant}
          onChange={(e) => setNewParticipant(e.target.value)}
          placeholder="Añadir participante"
        />
        <div className="grid grid-cols-10 gap-2 mb-4">
          {[...Array(100)].map((_, index) => {
            const number = index + 1;
            return (
              <button
                key={number}
                className={`border  p-2 rounded-[10px] p-2 ${selectedNumbers.includes(number)? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-gradient text-white'}`}
                onClick={() =>!selectedNumbers.includes(number)? selectNumber(number) : deselectNumber(number)}
                disabled={selectedNumbers.includes(number)}
              >
                {number}
              </button>
            );
          })}
        </div>
        <button
          className={`py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-gold-gradient rounded-[10px] outline-none ${styles}`}
          onClick={saveParticipant}
          disabled={!isAdmin}
        >
          Guardar
        </button>
      </div>
      <div className="mb-4">
        <button
          className={`py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-gold-gradient rounded-[10px] outline-none ${styles}`}
          onClick={drawWinner}
          disabled={!isAdmin}
        >
          Sorteo
        </button>
        <button
          className={`m-2 py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-gold-gradient rounded-[10px] outline-none ${styles}`}
          onClick={resetRaffle}
          disabled={!isAdmin}
        >
          Reiniciar
        </button>
        <button
          className={`m-2 py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-gold-gradient rounded-[10px] outline-none ${styles}`}
          onClick={handleAdminClick}
          disabled={isAdmin}
        >
          Administrar
        </button>
      </div>
      {winner && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Ganador: {winner.name} con el número {winner.number}</h2>
        </div>
      )}
      <ul className="className={`py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-gold-gradient rounded-[10px] outline-none ${styles}`}">
        {participants.map((participant, index) => (
          <li key={participant.id} className="border-b p-2">
            {participant.name} - Número: {participant.number}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RaffleGame;
