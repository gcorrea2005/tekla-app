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
    checkStatus, loadObjects, loadComponents,
    applyConnection, applyBatch, clearResults,
  } = useTekla();

  const [selected, setSelected] = useState([]);
  const [tab, setTab] = useState('single');

  useEffect(() => {
    checkStatus();
    loadComponents();
  }, [checkStatus, loadComponents]);

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
      />

      {!connected && (
        <div className="not-connected">
          <h2>No conectado a Tekla Structures</h2>
          <p>Asegurate de que Tekla Structures 2020 este abierto con un modelo cargado.</p>
          <button onClick={checkStatus}>Reintentar Conexion</button>
        </div>
      )}

      {connected && (
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
