"""
Tekla Connection Manager - Flask API Server
Replaces the Express/edge-js server with Flask/pythonnet.
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from tekla_bridge import (
    check_connection,
    get_all_beams,
    get_all_columns,
    get_all_objects,
    apply_connection,
    delete_connection,
)

app = Flask(__name__)
CORS(app)

COMPONENT_CATALOG = [
    {"number": 1, "name": "Clip Angle", "category": "Beam to Column"},
    {"number": 10, "name": "End Plate", "category": "Beam to Column"},
    {"number": 11, "name": "Splice Plate", "category": "Beam to Beam"},
    {"number": 44, "name": "Shear Tab", "category": "Beam to Column"},
    {"number": 134, "name": "Column Seat", "category": "Beam to Column"},
    {"number": 142, "name": "Stiffened End Plate", "category": "Beam to Column"},
    {"number": 146, "name": "Bolted Bracket", "category": "Beam to Column"},
    {"number": 80, "name": "Purlin Clip Angle", "category": "Purlin to Beam"},
    {"number": 81, "name": "Sleeve Connection", "category": "Beam to Beam"},
    {"number": 82, "name": "Corner Bracket", "category": "Beam to Column"},
]


# ==================== STATUS ====================

@app.route("/api/status")
def status():
    return jsonify(check_connection())


# ==================== MODEL ====================

@app.route("/api/beams")
def beams():
    return jsonify(get_all_beams())


@app.route("/api/columns")
def columns():
    return jsonify(get_all_columns())


@app.route("/api/objects")
def objects():
    return jsonify(get_all_objects())


# ==================== COMPONENTS ====================

@app.route("/api/components")
def components():
    return jsonify(COMPONENT_CATALOG)


# ==================== CONNECTIONS ====================

@app.route("/api/connections", methods=["POST"])
def create_connection():
    data = request.get_json()
    required = ["primaryId", "secondaryId", "componentNumber", "componentName"]

    if not all(k in data for k in required):
        return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400

    result = apply_connection(
        int(data["primaryId"]),
        int(data["secondaryId"]),
        int(data["componentNumber"]),
        data["componentName"],
    )
    return jsonify(result)


@app.route("/api/connections/advanced", methods=["POST"])
def create_connection_advanced():
    data = request.get_json()
    required = ["primaryId", "secondaryId", "componentNumber", "componentName"]

    if not all(k in data for k in required):
        return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400

    result = apply_connection(
        int(data["primaryId"]),
        int(data["secondaryId"]),
        int(data["componentNumber"]),
        data["componentName"],
    )
    return jsonify(result)


@app.route("/api/connections/batch", methods=["POST"])
def create_batch():
    data = request.get_json()
    connections = data.get("connections", [])

    if not connections:
        return jsonify({"success": False, "message": "Se requiere un array de conexiones"}), 400

    results = []
    for conn in connections:
        result = apply_connection(
            int(conn["primaryId"]),
            int(conn["secondaryId"]),
            int(conn["componentNumber"]),
            conn["componentName"],
        )
        results.append({**conn, **result})

    success_count = sum(1 for r in results if r.get("success"))
    return jsonify({
        "total": len(connections),
        "success": success_count,
        "failed": len(connections) - success_count,
        "results": results,
    })


@app.route("/api/connections/<int:connection_id>", methods=["DELETE"])
def remove_connection(connection_id):
    return jsonify(delete_connection(connection_id))


# ==================== START ====================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    print(f"Tekla API server running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
