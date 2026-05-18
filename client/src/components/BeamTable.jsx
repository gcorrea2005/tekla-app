import React from 'react';

export function BeamTable({ objects, loading, onLoad, selected, onSelect }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Elementos del Modelo</h2>
        <button onClick={onLoad} disabled={loading}>
          {loading ? 'Cargando...' : 'Cargar Elementos'}
        </button>
      </div>

      {objects.length === 0 ? (
        <p className="empty">No hay elementos cargados. Haz clic en "Cargar Elementos".</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Perfil</th>
                <th>Material</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((obj) => (
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
                  <td>{obj.id}</td>
                  <td>{obj.name}</td>
                  <td>
                    <span className={`type-tag ${obj.type?.toLowerCase()}`}>
                      {obj.type === 'BEAM' ? 'Viga' : 'Columna'}
                    </span>
                  </td>
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
