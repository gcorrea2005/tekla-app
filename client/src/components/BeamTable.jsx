import React from 'react';

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
  const sorted = [...objects].sort((a, b) => {
    const typeA = a.type === 'BEAM' ? 0 : 1;
    const typeB = b.type === 'BEAM' ? 0 : 1;
    if (typeA !== typeB) return typeA - typeB;
    const la = levelOrder(a.level);
    const lb = levelOrder(b.level);
    if (la !== lb) return la.localeCompare(lb);
    return parsePartNum(a.partMark) - parsePartNum(b.partMark);
  });

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Elementos del Modelo</h2>
        <button onClick={onLoad} disabled={loading}>
          {loading ? 'Cargando...' : 'Cargar Elementos'}
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="empty">No hay elementos cargados. Haz clic en "Cargar Elementos".</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Parte</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Nivel</th>
                <th>Perfil</th>
                <th>Material</th>
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
                  <td>{obj.partMark}</td>
                  <td>{obj.name}</td>
                  <td>
                    <span className={`type-tag ${obj.type?.toLowerCase()}`}>
                      {obj.type === 'BEAM' ? 'Viga' : 'Columna'}
                    </span>
                  </td>
                  <td>{obj.level}</td>
                  <td>{obj.profile}</td>
                  <td>{obj.material}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected.length > 0 && (
        <p className="selection-count">{selected.length} elemento(s) seleccionado(s)</p>
      )}
    </section>
  );
}
