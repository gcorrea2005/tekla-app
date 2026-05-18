import React from 'react';

export function BatchPanel({ objects, onApplyBatch, loading, results, onClear }) {
  const beams = objects.filter((o) => o.type === 'BEAM');
  const columns = objects.filter((o) => o.type === 'COLUMN');

  const handleAutoGenerate = async () => {
    if (beams.length === 0 || columns.length === 0) return;

    const connections = [];
    for (const beam of beams) {
      for (const col of columns) {
        connections.push({
          primaryId: col.id,
          secondaryId: beam.id,
          componentNumber: 44,
          componentName: 'Shear Tab',
        });
      }
    }

    await onApplyBatch(connections);
  };

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Aplicacion en Lote</h2>
        {results.length > 0 && (
          <button className="btn-secondary" onClick={onClear}>
            Limpiar Resultados
          </button>
        )}
      </div>

      <div className="batch-info">
        <p>
          Genera automaticamente conexiones Shear Tab entre todas las vigas y columnas del modelo.
        </p>
        <div className="batch-stats">
          <span>{columns.length} columnas</span>
          <span>{beams.length} vigas</span>
          <span>{columns.length * beams.length} conexiones estimadas</span>
        </div>
      </div>

      <button
        onClick={handleAutoGenerate}
        disabled={loading || beams.length === 0 || columns.length === 0}
      >
        {loading ? 'Procesando...' : 'Generar y Aplicar Todas las Conexiones'}
      </button>

      {results.length > 0 && (
        <div className="results-summary">
          <div className="summary-cards">
            <div className="card">
              <span className="card-value">{results.length}</span>
              <span className="card-label">Total</span>
            </div>
            <div className="card success">
              <span className="card-value">{successCount}</span>
              <span className="card-label">Exitosas</span>
            </div>
            <div className="card error">
              <span className="card-value">{failCount}</span>
              <span className="card-label">Fallidas</span>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Primaria</th>
                  <th>Secundaria</th>
                  <th>Componente</th>
                  <th>Estado</th>
                  <th>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className={r.success ? 'row-success' : 'row-error'}>
                    <td>#{r.primaryId}</td>
                    <td>#{r.secondaryId}</td>
                    <td>{r.componentName}</td>
                    <td>{r.success ? 'OK' : 'ERROR'}</td>
                    <td>{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
