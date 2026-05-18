require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { checkConnection } = require('./tekla/status');
const { getAllBeams, getAllColumns, getAllObjects } = require('./tekla/model');
const { applyConnection, applyConnectionWithParams, deleteConnection } = require('./tekla/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==================== STATUS ====================

app.get('/api/status', async (req, res) => {
  try {
    const result = await checkConnection({});
    res.json(result);
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// ==================== MODEL ====================

app.get('/api/beams', async (req, res) => {
  try {
    const beams = await getAllBeams({});
    res.json(beams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/columns', async (req, res) => {
  try {
    const columns = await getAllColumns({});
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/objects', async (req, res) => {
  try {
    const objects = await getAllObjects({});
    res.json(objects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CONNECTIONS ====================

app.post('/api/connections', async (req, res) => {
  const { primaryId, secondaryId, componentNumber, componentName } = req.body;

  if (!primaryId || !secondaryId || !componentNumber || !componentName) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: primaryId, secondaryId, componentNumber, componentName'
    });
  }

  try {
    const result = await applyConnection({
      primaryId: Number(primaryId),
      secondaryId: Number(secondaryId),
      componentNumber: Number(componentNumber),
      componentName
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/connections/advanced', async (req, res) => {
  const { primaryId, secondaryId, componentNumber, componentName, boltSize, plateThickness } = req.body;

  if (!primaryId || !secondaryId || !componentNumber || !componentName) {
    return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
  }

  try {
    const result = await applyConnectionWithParams({
      primaryId: Number(primaryId),
      secondaryId: Number(secondaryId),
      componentNumber: Number(componentNumber),
      componentName,
      boltSize: boltSize || 'M16',
      plateThickness: Number(plateThickness) || 10.0
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/connections/batch', async (req, res) => {
  const { connections } = req.body;

  if (!Array.isArray(connections) || connections.length === 0) {
    return res.status(400).json({ success: false, message: 'Se requiere un array de conexiones' });
  }

  const results = [];

  for (const conn of connections) {
    try {
      const result = await applyConnection({
        primaryId: Number(conn.primaryId),
        secondaryId: Number(conn.secondaryId),
        componentNumber: Number(conn.componentNumber),
        componentName: conn.componentName
      });
      results.push({ ...conn, ...result });
    } catch (err) {
      results.push({ ...conn, success: false, message: err.message });
    }
  }

  res.json({
    total: connections.length,
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  });
});

app.delete('/api/connections/:id', async (req, res) => {
  try {
    const result = await deleteConnection({ connectionId: Number(req.params.id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== COMPONENT CATALOG ====================

const COMPONENT_CATALOG = [
  { number: 1, name: 'Clip Angle', category: 'Beam to Column' },
  { number: 10, name: 'End Plate', category: 'Beam to Column' },
  { number: 11, name: 'Splice Plate', category: 'Beam to Beam' },
  { number: 44, name: 'Shear Tab', category: 'Beam to Column' },
  { number: 134, name: 'Column Seat', category: 'Beam to Column' },
  { number: 142, name: 'Stiffened End Plate', category: 'Beam to Column' },
  { number: 146, name: 'Bolted Bracket', category: 'Beam to Column' },
];

app.get('/api/components', (req, res) => {
  res.json(COMPONENT_CATALOG);
});

// ==================== START ====================

app.listen(PORT, () => {
  console.log(`Tekla API server running on http://localhost:${PORT}`);
});
