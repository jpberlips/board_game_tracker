import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SessionCard from '../components/SessionCard';
import AddSessionModal from '../components/AddSessionModal';
import EditSessionModal from '../components/EditSessionModal';

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, gamesRes, playersRes] = await Promise.all([
        api.getSessions(),
        api.getGames(),
        api.getPlayers(),
      ]);
      setSessions(sessionsRes.data);
      setGames(gamesRes.data);
      setPlayers(playersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (sessionData) => {
    try {
      await api.createSession(sessionData);
      fetchData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (sessionData) => {
    try {
      await api.updateSession(editingSession.id, sessionData);
      fetchData();
      setShowEditModal(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.deleteSession(sessionId);
        fetchData();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading sessions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Game Sessions</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Log New Session
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard 
            key={session.id} 
            session={session}
            onEdit={handleEditSession}
            onDelete={handleDeleteSession}
          />
        ))}
      </div>

      {showAddModal && (
        <AddSessionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSession}
          games={games}
          existingPlayers={players}
        />
      )}

      {showEditModal && (
        <EditSessionModal
          session={editingSession}
          onClose={() => {
            setShowEditModal(false);
            setEditingSession(null);
          }}
          onSave={handleSaveEdit}
          games={games}
          existingPlayers={players}
        />
      )}
    </div>
  );
}

export default SessionsPage;