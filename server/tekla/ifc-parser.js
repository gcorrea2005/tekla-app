const WebIFC = require('web-ifc');

let ifcApi = null;

function getIfcApi() {
  if (ifcApi) return ifcApi;
  ifcApi = new WebIFC.IfcAPI();
  return ifcApi;
}

async function parseIfcBuffer(buffer) {
  const api = getIfcApi();

  await api.Init();
  const modelId = api.OpenModel(new Uint8Array(buffer));

  const beams = [];

  // Extract IfcBeam elements
  const beamIds = api.GetLineIDsWithType(modelId, WebIFC.IFCBEAM);
  for (let i = 0; i < beamIds.size(); i++) {
    const beam = extractElement(api, modelId, beamIds.get(i), 'BEAM');
    if (beam) beams.push(beam);
  }

  // Extract IfcColumn elements
  const columnIds = api.GetLineIDsWithType(modelId, WebIFC.IFCCOLUMN);
  for (let i = 0; i < columnIds.size(); i++) {
    const col = extractElement(api, modelId, columnIds.get(i), 'COLUMN');
    if (col) beams.push(col);
  }

  api.CloseModel(modelId);

  return beams;
}

function extractElement(api, modelId, expressId, type) {
  try {
    const props = api.GetLine(modelId, expressId);

    const name = getStringValue(props, 'Name') || '';
    const objectType = getStringValue(props, 'ObjectType') || '';

    // Get property sets for profile, material, etc.
    const psets = getPropertySets(api, modelId, expressId);

    const profile = findPropertyValue(psets, 'Profile') ||
                    findPropertyValue(psets, 'CrossSection') || '';
    const material = findPropertyValue(psets, 'Material') || '';

    // Get placement coordinates
    const placement = getPlacement(api, modelId, props);

    return {
      id: expressId,
      name: type === 'COLUMN' ? 'COLUMN' : (name || 'BEAM'),
      type,
      partMark: name || `#${expressId}`,
      level: findPropertyValue(psets, 'Level') || '',
      cota: '',
      profile: profile || objectType || '',
      material: material || '',
      startX: placement.startX,
      startY: placement.startY,
      startZ: placement.startZ,
      endX: placement.endX,
      endY: placement.endY,
      endZ: placement.endZ,
      class: type === 'COLUMN' ? '2' : '1',
    };
  } catch (err) {
    return null;
  }
}

function getStringValue(props, key) {
  if (!props || !props[key]) return null;
  const val = props[key];
  if (typeof val === 'string') return val;
  if (val.value !== undefined) return String(val.value);
  return null;
}

function getPlacement(api, modelId, props) {
  const result = { startX: 0, startY: 0, startZ: 0, endX: 0, endY: 0, endZ: 0 };

  try {
    const placement = props.ObjectPlacement;
    if (!placement) return result;

    // Try to get coordinates from the placement
    // This is simplified - IFC placement hierarchy can be complex
    if (placement.Location) {
      const loc = api.GetLine(modelId, placement.Location);
      if (loc && loc.Coordinates) {
        const coords = loc.Coordinates;
        if (coords.length >= 3) {
          result.startX = typeof coords[0] === 'object' ? coords[0].value : coords[0];
          result.startY = typeof coords[1] === 'object' ? coords[1].value : coords[1];
          result.startZ = typeof coords[2] === 'object' ? coords[2].value : coords[2];
        }
      }
    }
  } catch (e) {
    // placement parsing failed, return zeros
  }

  return result;
}

function getPropertySets(api, modelId, expressId) {
  const psets = [];

  try {
    // Get IfcRelDefinesByProperties
    const relIds = api.GetLineIDsWithType(modelId, WebIFC.IFCRELDEFINESBYPROPERTIES);

    for (let i = 0; i < relIds.size(); i++) {
      const rel = api.GetLine(modelId, relIds.get(i));
      if (!rel.RelatedObjects) continue;

      const relatedIds = rel.RelatedObjects;
      let found = false;

      for (let j = 0; j < relatedIds.length; j++) {
        const rid = typeof relatedIds[j] === 'object' ? relatedIds[j].value : relatedIds[j];
        if (rid === expressId) {
          found = true;
          break;
        }
      }

      if (!found) continue;

      // Get the property set
      const psetId = rel.RelatingPropertyDefinition;
      const pid = typeof psetId === 'object' ? psetId.value : psetId;
      const pset = api.GetLine(modelId, pid);

      if (pset && pset.HasProperties) {
        const props = {};
        for (let k = 0; k < pset.HasProperties.length; k++) {
          const prop = pset.HasProperties[k];
          const pname = getStringValue(prop, 'Name') || '';
          const pval = prop.NominalValue;
          if (pname && pval) {
            props[pname] = typeof pval === 'object' ? (pval.value || pval) : pval;
          }
        }
        psets.push(props);
      }
    }
  } catch (e) {
    // property extraction failed
  }

  return psets;
}

function findPropertyValue(psets, propName) {
  for (const pset of psets) {
    for (const [key, val] of Object.entries(pset)) {
      if (key.toLowerCase().includes(propName.toLowerCase())) {
        return String(val);
      }
    }
  }
  return null;
}

module.exports = { parseIfcBuffer };
