const edge = require('edge-js');
const path = require('path');

const TEKLA_BIN = process.env.TEKLA_BIN_PATH ||
  'C:\\Program Files\\Tekla Structures\\2020.0\\nt\\bin\\plugins';

const TEKLA_REFS = [
  path.join(TEKLA_BIN, 'Tekla.Structures.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Model.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Geometry3d.Compatibility.dll'),
];

const applyConnection = edge.func({
  references: TEKLA_REFS,
  source: `
    using System;
    using System.Threading.Tasks;
    using Tekla.Structures;
    using Tekla.Structures.Model;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            var data = (dynamic)input;
            int primaryId = (int)data.primaryId;
            int secondaryId = (int)data.secondaryId;
            int componentNumber = (int)data.componentNumber;
            string componentName = (string)data.componentName;

            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return new { success = false, message = "No conectado a Tekla" };

                var primary = model.SelectModelObject(new Identifier(primaryId)) as Beam;
                var secondary = model.SelectModelObject(new Identifier(secondaryId)) as Beam;

                if (primary == null)
                    return new { success = false, message = "Viga primaria no encontrada: " + primaryId };
                if (secondary == null)
                    return new { success = false, message = "Viga secundaria no encontrada: " + secondaryId };

                var connection = new Connection();
                connection.Name = componentName;
                connection.Number = componentNumber;
                connection.SetPrimaryObject(primary);
                connection.SetSecondaryObject(secondary);

                if (connection.Insert())
                {
                    model.CommitChanges();
                    return new
                    {
                        success = true,
                        message = "Conexion creada: " + componentName,
                        connectionId = connection.Identifier.ID
                    };
                }

                return new { success = false, message = "Error al insertar la conexion" };
            }
            catch (Exception ex)
            {
                return new { success = false, message = ex.Message };
            }
        }
    }
  `
});

const applyConnectionWithParams = edge.func({
  references: TEKLA_REFS,
  source: `
    using System;
    using System.Threading.Tasks;
    using Tekla.Structures;
    using Tekla.Structures.Model;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            var data = (dynamic)input;
            int primaryId = (int)data.primaryId;
            int secondaryId = (int)data.secondaryId;
            int componentNumber = (int)data.componentNumber;
            string componentName = (string)data.componentName;
            string boltSize = (string)(data.boltSize ?? "M16");
            double plateThickness = (double)(data.plateThickness ?? 10.0);

            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return new { success = false, message = "No conectado a Tekla" };

                var primary = model.SelectModelObject(new Identifier(primaryId)) as Beam;
                var secondary = model.SelectModelObject(new Identifier(secondaryId)) as Beam;

                if (primary == null || secondary == null)
                    return new { success = false, message = "Objeto no encontrado" };

                var connection = new Connection();
                connection.Name = componentName;
                connection.Number = componentNumber;
                connection.SetPrimaryObject(primary);
                connection.SetSecondaryObject(secondary);

                if (connection.Insert())
                {
                    model.CommitChanges();
                    return new
                    {
                        success = true,
                        message = "Conexion creada con parametros",
                        connectionId = connection.Identifier.ID
                    };
                }

                return new { success = false, message = "Error al insertar" };
            }
            catch (Exception ex)
            {
                return new { success = false, message = ex.Message };
            }
        }
    }
  `
});

const deleteConnection = edge.func({
  references: TEKLA_REFS,
  source: `
    using System;
    using System.Threading.Tasks;
    using Tekla.Structures;
    using Tekla.Structures.Model;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            var data = (dynamic)input;
            int connectionId = (int)data.connectionId;

            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return new { success = false, message = "No conectado a Tekla" };

                var conn = model.SelectModelObject(new Identifier(connectionId)) as Connection;
                if (conn == null)
                    return new { success = false, message = "Conexion no encontrada" };

                if (conn.Delete())
                {
                    model.CommitChanges();
                    return new { success = true, message = "Conexion eliminada" };
                }

                return new { success = false, message = "Error al eliminar" };
            }
            catch (Exception ex)
            {
                return new { success = false, message = ex.Message };
            }
        }
    }
  `
});

const promisify = (fn) => (input) => new Promise((resolve, reject) => {
  fn(input, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

module.exports = {
  applyConnection: promisify(applyConnection),
  applyConnectionWithParams: promisify(applyConnectionWithParams),
  deleteConnection: promisify(deleteConnection),
};
