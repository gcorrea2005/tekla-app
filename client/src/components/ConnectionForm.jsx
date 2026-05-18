import React, { useState } from 'react';

const COMPONENTS = [
  { number: 44, name: 'Shear Tab', category: 'Beam to Column' },
  { number: 10, name: 'End Plate', category: 'Beam to Column' },
  { number: 134, name: 'Column Seat', category: 'Beam to Column' },
  { number: 1, name: 'Clip Angle', category: 'Beam to Column' },
  { number: 11, name: 'Splice Plate', category: 'Beam to Beam' },
  { number: 142, name: 'Stiffened End Plate', category: 'Beam to Column' },
  { number: 146, name: 'Bolted Bracket', category: 'Beam to Column' },
];

export function ConnectionForm({ objects, onSubmit, loading }) {
  const [primaryId, setPrimaryId] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [component, setComponent] = useState(COMPONENTS[0]);
  const [boltSize, setBoltSize] = useState('M16');
  const [plateThickness, setPlateThickness] = useState(10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!primaryId || !secondaryId) return;

    await onSubmit({
      primaryId: Number(primaryId),
      secondaryId: Number(secondaryId),
      componentNumber: component.number,
      componentName: component.name,
      boltSize,
      plateThickness: Number(plateThickness),
    });
  };

  const beams = objects.filter((o) => o.type === 'BEAM');
  const columns = objects.filter((o) => o.type === 'COLUMN');

  return (
    <section className="panel">
      <h2>Aplicar Conexion</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Elemento Primario
            <select value={primaryId} onChange={(e) => setPrimaryId(e.target.value)}>
              <option value="">Seleccionar...</option>
              <optgroup label="Columnas">
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} - {c.name} ({c.profile})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Vigas">
                {beams.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.id} - {b.name} ({b.profile})
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <label>
            Elemento Secundario
            <select value={secondaryId} onChange={(e) => setSecondaryId(e.target.value)}>
              <option value="">Seleccionar...</option>
              <optgroup label="Vigas">
                {beams.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.id} - {b.name} ({b.profile})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Columnas">
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} - {c.name} ({c.profile})
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Tipo de Conexion
            <select
              value={component.number}
              onChange={(e) =>
                setComponent(COMPONENTS.find((c) => c.number === Number(e.target.value)))
              }
            >
              {COMPONENTS.map((c) => (
                <option key={c.number} value={c.number}>
                  #{c.number} - {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tamano de Tornillo
            <select value={boltSize} onChange={(e) => setBoltSize(e.target.value)}>
              <option value="M12">M12</option>
              <option value="M16">M16</option>
              <option value="M20">M20</option>
              <option value="M24">M24</option>
            </select>
          </label>

          <label>
            Espesor de Placa (mm)
            <input
              type="number"
              value={plateThickness}
              onChange={(e) => setPlateThickness(e.target.value)}
              min="6"
              max="40"
            />
          </label>
        </div>

        <button type="submit" disabled={loading || !primaryId || !secondaryId}>
          {loading ? 'Aplicando...' : 'Aplicar Conexion'}
        </button>
      </form>
    </section>
  );
}
