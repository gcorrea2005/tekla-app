import React from 'react';

export function StatusBar({ connected, modelName, loading, error, onRefresh, source, onSourceChange }) {
  return (
    <header className="status-bar">
      <div className="status-left">
        <h1>Tekla Connection Manager</h1>
        <div className="source-toggle">
          <button
            className={`toggle-btn ${source === 'local' ? 'active' : ''}`}
            onClick={() => onSourceChange('local')}
          >
            Local
          </button>
          <button
            className={`toggle-btn ${source === 'remote' ? 'active' : ''}`}
            onClick={() => onSourceChange('remote')}
          >
            OneDrive
          </button>
        </div>
        {source === 'local' && (
          <>
            <span className={`status-badge ${connected ? 'online' : 'offline'}`}>
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
            {modelName && <span className="model-name">{modelName}</span>}
          </>
        )}
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
