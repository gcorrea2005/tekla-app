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


def _extract_object(obj, type_name=None):
    """Extract common properties from a model object."""
    if type_name is None:
        type_name = _get_beam_type(obj)
    return {
        "id": obj.Identifier.ID,
        "name": obj.Name or "",
        "type": type_name,
        "profile": obj.Profile.ProfileString or "",
        "material": obj.Material.MaterialString or "",
        "startX": obj.StartPoint.X,
        "startY": obj.StartPoint.Y,
        "startZ": obj.StartPoint.Z,
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
            if _get_beam_type(obj) == "BEAM":
                results.append(_extract_object(obj, "BEAM"))
    except Exception as e:
        results.append({"error": str(e)})
    return results


def get_all_columns():
    """Get all column objects from the model."""
    results = []
    try:
        for obj in _get_all_model_objects():
            if _get_beam_type(obj) == "COLUMN":
                results.append(_extract_object(obj, "COLUMN"))
    except Exception as e:
        results.append({"error": str(e)})
    return results


def get_all_objects():
    """Get all beams and columns from the model."""
    results = []
    try:
        for obj in _get_all_model_objects():
            results.append(_extract_object(obj))
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
