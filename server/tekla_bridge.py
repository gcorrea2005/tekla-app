"""
Tekla Structures 2020 API Bridge via pythonnet
This module loads Tekla .NET assemblies and exposes Python functions.
"""

import os
import clr

TEKLA_BIN = os.environ.get(
    "TEKLA_BIN_PATH",
    r"C:\Program Files\Tekla Structures\2020.0\nt\bin\plugins"
)

# Load Tekla assemblies
clr.AddReference(os.path.join(TEKLA_BIN, "Tekla.Structures.Model"))
clr.AddReference(os.path.join(TEKLA_BIN, "Tekla.Structures.Geometry3d.Compatibility"))

import Tekla.Structures.Model as TSM
import Tekla.Structures as TS

Model = TSM.Model
Connection = TSM.Connection
Beam = TSM.Beam
ModelObject = TSM.ModelObject
Identifier = TS.Identifier


def check_connection():
    """Check if Tekla Structures is connected."""
    try:
        model = Model()
        connected = model.GetConnectionStatus()
        name = ""
        if connected:
            try:
                name = model.GetName()
            except Exception:
                name = "Tekla Model"
        return {"connected": connected, "name": name}
    except Exception as e:
        return {"connected": False, "name": "", "error": str(e)}


def _is_concrete(obj):
    """Check if an object is made of concrete."""
    try:
        mat = (obj.Material.MaterialString or "").upper()
        return mat.startswith("C") or "CONCRETE" in mat
    except Exception:
        return False


def _is_plate(obj):
    """Check if an object is a plate (profile starts with PL)."""
    try:
        profile = (obj.Profile.ProfileString or "").upper()
        return profile.startswith("PL")
    except Exception:
        return False


def _get_beam_type(beam):
    """Determine if a beam is a column or beam by class number.
    In Tekla default environments: class 1 = beam, class 2 = column.
    Falls back to orientation check if class is non-standard.
    """
    try:
        cls = beam.Class or ""
        if cls.strip() == "2":
            return "COLUMN"
        if cls.strip() == "1":
            return "BEAM"
    except Exception:
        pass
    # Fallback: check if the element is vertical (X and Z same, Y differs)
    try:
        dx = abs(beam.EndPoint.X - beam.StartPoint.X)
        dz = abs(beam.EndPoint.Z - beam.StartPoint.Z)
        dy = abs(beam.EndPoint.Y - beam.StartPoint.Y)
        if dx < 0.01 and dz < 0.01 and dy > 0.01:
            return "COLUMN"
    except Exception:
        pass
    return "BEAM"


_grid_levels = None  # Cached grid levels: list of (z_coord, label)


def _load_grid_levels():
    """Load grid level names and Z coordinates from Tekla model."""
    global _grid_levels
    if _grid_levels is not None:
        return _grid_levels
    try:
        model = Model()
        selector = model.GetModelObjectSelector()
        enumerator = selector.GetAllObjects()
        while enumerator.MoveNext():
            obj = enumerator.Current
            if obj is not None and type(obj).__name__ == 'Grid':
                coords_str = str(obj.CoordinateZ)
                labels_str = str(obj.LabelZ)
                coords = [float(c.strip()) for c in coords_str.split() if c.strip()]
                labels = [l.strip() for l in labels_str.split() if l.strip()]
                if len(coords) == len(labels):
                    _grid_levels = sorted(zip(coords, labels), key=lambda x: x[0])
                    return _grid_levels
    except Exception:
        pass
    _grid_levels = []
    return _grid_levels


def _get_level(z):
    """Get level name from Z coordinate using grid levels."""
    levels = _load_grid_levels()
    if not levels:
        return ""
    # Find the closest level (nearest below or equal to z)
    best_label = levels[0][1]
    for coord, label in levels:
        if z >= coord - 500:  # 500mm tolerance
            best_label = label
        else:
            break
    return best_label


def _extract_object(obj, type_name=None):
    """Extract common properties from a model object."""
    if type_name is None:
        type_name = _get_beam_type(obj)
    part_mark = ""
    try:
        part_mark = obj.GetPartMark() or ""
    except Exception:
        pass
    start_z = obj.StartPoint.Z
    level = _get_level(start_z)
    return {
        "id": obj.Identifier.ID,
        "name": obj.Name or "",
        "type": type_name,
        "partMark": part_mark,
        "level": level,
        "profile": obj.Profile.ProfileString or "",
        "material": obj.Material.MaterialString or "",
        "startX": obj.StartPoint.X,
        "startY": obj.StartPoint.Y,
        "startZ": start_z,
        "endX": obj.EndPoint.X,
        "endY": obj.EndPoint.Y,
        "endZ": obj.EndPoint.Z,
        "class": obj.Class or "",
    }


def _get_all_model_objects():
    """Get all BEAM objects from Tekla (columns are also BEAMs with class 2)."""
    model = Model()
    if not model.GetConnectionStatus():
        return []
    enumerator = model.GetModelObjectSelector().GetAllObjectsWithType(
        ModelObject.ModelObjectEnum.BEAM
    )
    objects = []
    while enumerator.MoveNext():
        obj = enumerator.Current
        if obj is not None:
            objects.append(obj)
    return objects


def get_all_beams():
    """Get all beam objects from the model."""
    results = []
    try:
        for obj in _get_all_model_objects():
            if not _is_concrete(obj) and _get_beam_type(obj) == "BEAM":
                results.append(_extract_object(obj, "BEAM"))
    except Exception as e:
        results.append({"error": str(e)})
    return results


def get_all_columns():
    """Get all column objects from the model."""
    results = []
    try:
        for obj in _get_all_model_objects():
            if not _is_concrete(obj) and _get_beam_type(obj) == "COLUMN":
                results.append(_extract_object(obj, "COLUMN"))
    except Exception as e:
        results.append({"error": str(e)})
    return results


def get_all_objects():
    """Get all structural beams from the model (no columns, no plates)."""
    results = []
    try:
        for obj in _get_all_model_objects():
            if not _is_concrete(obj) and not _is_plate(obj):
                obj_type = _get_beam_type(obj)
                if obj_type == "BEAM":
                    results.append(_extract_object(obj, "BEAM"))
    except Exception as e:
        results.append({"error": str(e)})
    return results


def apply_connection(primary_id, secondary_id, component_number, component_name):
    """Apply a connection between two model objects."""
    try:
        model = Model()
        if not model.GetConnectionStatus():
            return {"success": False, "message": "No conectado a Tekla"}

        primary = model.SelectModelObject(Identifier(primary_id))
        secondary = model.SelectModelObject(Identifier(secondary_id))

        if primary is None:
            return {"success": False, "message": f"Objeto primario no encontrado: {primary_id}"}
        if secondary is None:
            return {"success": False, "message": f"Objeto secundario no encontrado: {secondary_id}"}

        connection = Connection()
        connection.Name = component_name
        connection.Number = component_number
        connection.SetPrimaryObject(primary)
        connection.SetSecondaryObject(secondary)

        if connection.Insert():
            model.CommitChanges()
            return {
                "success": True,
                "message": f"Conexion creada: {component_name}",
                "connectionId": connection.Identifier.ID,
            }

        return {"success": False, "message": "Error al insertar la conexion"}
    except Exception as e:
        return {"success": False, "message": str(e)}


def delete_connection(connection_id):
    """Delete a connection by ID."""
    try:
        model = Model()
        if not model.GetConnectionStatus():
            return {"success": False, "message": "No conectado a Tekla"}

        conn = model.SelectModelObject(Identifier(connection_id))
        if conn is None:
            return {"success": False, "message": "Conexion no encontrada"}

        if conn.Delete():
            model.CommitChanges()
            return {"success": True, "message": "Conexion eliminada"}

        return {"success": False, "message": "Error al eliminar"}
    except Exception as e:
        return {"success": False, "message": str(e)}
