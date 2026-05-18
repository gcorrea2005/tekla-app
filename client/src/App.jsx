import React, { useEffect, useState } from 'react';
import { StatusBar } from './components/StatusBar';
import { BeamTable } from './components/BeamTable';
import { ConnectionForm } from './components/ConnectionForm';
import { BatchPanel } from './components/BatchPanel';
import { useTekla } from './hooks/useTekla';

export default function App() {
  const {
    connected, modelName, objects, components,
    loading, error, results,
    source, setSource,
    remoteFiles, selectedFile,
    checkStatus, loadObjects, loadComponents,
    loadRemoteFiles, loadRemoteBeams,
    applyConnection, applyBatch, clearResults,
  } = useTekla();

  const [selected, setSelected] = useState([]);
  const [tab, setTab] = useState('single');

  useEffect(() => {
    checkStatus();
    loadComponents();
  }, [checkStatus, loadComponents]);

  useEffect(() => {
    if (source === 'remote') {
      loadRemoteFiles();
    }
  }, [source, loadRemoteFiles]);

  const handleSourceChange = (newSource) => {
    setSource(newSource);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="app">
      <StatusBar
        connected={connected}
        modelName={modelName}
        loading={loading}
        error={error}
        onRefresh={() => { checkStatus(); loadObjects(); }}
        source={source}
        onSourceChange={handleSourceChange}
      />

      {source === 'local' && !connected && (
        <div className="not-connected">
          <h2>No conectado a Tekla Structures</h2>
          <p>Asegurate de que Tekla Structures 2020 este abierto con un modelo cargado.</p>
          <button onClick={checkStatus}>Reintentar Conexion</button>
        </div>
      )}

      {source === 'remote' && (
        <main>
          <div className="panel">
            <div className="panel-header">
              <h2>Archivos IFC en OneDrive</h2>
              <button onClick={loadRemoteFiles} disabled={loading}>
                {loading ? 'Cargando...' : 'Actualizar lista'}
              </button>
            </div>
            {remoteFiles.length === 0 ? (
              <p className="empty">No se encontraron archivos IFC o no hay conexion a OneDrive.</p>
            ) : (
              <div className="file-list">
                {remoteFiles.map((file) => (
                  <button
                    key={file.id}
                    className={`file-item ${selectedFile === file.id ? 'active' : ''}`}
                    onClick={() => loadRemoteBeams(file.id)}
                  >
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {objects.length > 0 && (
            <BeamTable
              objects={objects}
              loading={loading}
              onLoad={() => {}}
              selected={selected}
              onSelect={handleSelect}
            />
          )}
        </main>
      )}

      {source === 'local' && connected && (
        <main>
          <BeamTable
            objects={objects}
            loading={loading}
            onLoad={loadObjects}
            selected={selected}
            onSelect={handleSelect}
          />

          <div className="tabs">
            <button
              className={tab === 'single' ? 'active' : ''}
              onClick={() => setTab('single')}
            >
              Conexion Individual
            </button>
            <button
              className={tab === 'batch' ? 'active' : ''}
              onClick={() => setTab('batch')}
            >
              Aplicacion en Lote
            </button>
          </div>

          {tab === 'single' && (
            <ConnectionForm
              objects={objects}
              onSubmit={applyConnection}
              loading={loading}
            />
          )}

          {tab === 'batch' && (
            <BatchPanel
              objects={objects}
              onApplyBatch={applyBatch}
              loading={loading}
              results={results}
              onClear={clearResults}
            />
          )}
        </main>
      )}
    </div>
  );
}
