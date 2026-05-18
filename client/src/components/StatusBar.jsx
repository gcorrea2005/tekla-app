import React from 'react';

export function StatusBar({ connected, modelName, loading, error, onRefresh }) {
  return (
    <header className="status-bar">
      <div className="status-left">
        <h1>Tekla Connection Manager</h1>
        <span className={`status-badge ${connected ? 'online' : 'offline'}`}>
          {connected ? 'Conectado' : 'Desconectado'}
        </span>
        {modelName && <span className="model-name">{modelName}</span>}
      </div>
      <div className="status-right">
        {error && <span className="error-msg">{error}</span>}
        <button onClick={onRefresh} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>
    </header>
  );
}
