const edge = require('edge-js');
const path = require('path');

const TEKLA_BIN = process.env.TEKLA_BIN_PATH ||
  'C:\\Program Files\\Tekla Structures\\2020.0\\nt\\bin';

// Cargar assemblies de Tekla
edge.assemblies([
  path.join(TEKLA_BIN, 'Tekla.Structures.Model.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Geometry3d.Compatibility.dll'),
]);

const checkConnection = edge.func({
  source: function () {/*
    using System.Threading.Tasks;
    using Tekla.Structures.Model;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            try
            {
                var model = new Model();
                var connected = model.GetConnectionStatus();
                var name = connected ? model.GetName() : "";
                return new { connected, name };
            }
            catch
            {
                return new { connected = false, name = "" };
            }
        }
    }
  */}
});

module.exports = { checkConnection };
