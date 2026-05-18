const edge = require('edge-js');
const path = require('path');

const TEKLA_BIN = process.env.TEKLA_BIN_PATH ||
  'C:\\Program Files\\Tekla Structures\\2020.0\\nt\\bin\\plugins';

const TEKLA_REFS = [
  path.join(TEKLA_BIN, 'Tekla.Structures.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Model.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Geometry3d.Compatibility.dll'),
];

const checkConnection = edge.func({
  references: TEKLA_REFS,
  source: `
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
                return new { connected };
            }
            catch
            {
                return new { connected = false };
            }
        }
    }
  `
});

const checkConnectionAsync = (input) => new Promise((resolve, reject) => {
  checkConnection(input, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

module.exports = { checkConnection: checkConnectionAsync };
