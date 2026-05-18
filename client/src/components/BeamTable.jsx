import React, { useState } from 'react';

function parsePartNum(partMark) {
  if (!partMark) return Infinity;
  const num = parseInt(partMark.split('/')[1], 10);
  return isNaN(num) ? Infinity : num;
}

// Extract sort order from level name: B2 < B1 < N01 < N02 < ... < CUB
function levelOrder(level) {
  if (!level) return 'ZZZ';
  return level;
}

export function BeamTable({ objects, loading, onLoad, selected, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = objects.filter((obj) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (obj.partMark || '').toLowerCase().includes(q) ||
      (obj.level || '').toLowerCase().includes(q) ||
      (obj.cota || '').toLowerCase().includes(q) ||
      (obj.profile || '').toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const la = levelOrder(a.level);
    const lb = levelOrder(b.level);
    if (la !== lb) return la.localeCompare(lb);
    return parsePartNum(a.partMark) - parsePartNum(b.partMark);
  });

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Elementos del Modelo</h2>
        <div className="panel-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por parte, nivel, cota o perfil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={onLoad} disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar Seleccionados'}
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="empty">Selecciona elementos en Tekla y haz clic en "Cargar Seleccionados".</p>
      ) : (
        <>
          <div className="table-stats">
            <span>Total: {sorted.length}</span>
            {selected.length > 0 && (
              <span className="selected-count">Seleccionados: {selected.length}</span>
            )}
          </div>
          <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nivel</th>
                <th>Cota</th>
                <th>Parte</th>
                <th>Perfil</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((obj) => (
                <tr
                  key={obj.id}
                  className={selected.includes(obj.id) ? 'selected' : ''}
                  onClick={() => onSelect(obj.id)}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(obj.id)}
                      onChange={() => onSelect(obj.id)}
                    />
                  </td>
                  <td>{obj.level}</td>
                  <td>{obj.cota}</td>
                  <td>{obj.partMark}</td>
                  <td>{obj.profile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

    </section>
  );
}
