const edge = require('edge-js');
const path = require('path');

const TEKLA_BIN = process.env.TEKLA_BIN_PATH ||
  'C:\\Program Files\\Tekla Structures\\2020.0\\nt\\bin\\plugins';

const TEKLA_REFS = [
  path.join(TEKLA_BIN, 'Tekla.Structures.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Model.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Geometry3d.Compatibility.dll'),
];

const getAllBeams = edge.func({
  references: TEKLA_REFS,
  source: `
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Tekla.Structures.Model;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            var result = new List<Dictionary<string, object>>();
            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return result;

                var enumerator = model.GetModelObjectSelector()
                    .GetAllObjectsWithType(ModelObject.ModelObjectEnum.BEAM);

                while (enumerator.MoveNext())
                {
                    var beam = enumerator.Current as Beam;
                    if (beam == null) continue;

                    var name = (beam.Name ?? "").ToUpper();
                    var material = (beam.Material.MaterialString ?? "").ToUpper();
                    var profile = (beam.Profile.ProfileString ?? "").ToUpper();

                    if (name == "COLUMN" || name == "PLATE") continue;
                    if (material.StartsWith("C") && material.Length > 1 && char.IsDigit(material[1])) continue;
                    if (material.Contains("HORMIGON") || material.Contains("CONCRETE")) continue;
                    if (profile.StartsWith("PL")) continue;

                    result.Add(new Dictionary<string, object>
                    {
                        { "id", beam.Identifier.ID },
                        { "name", beam.Name },
                        { "profile", beam.Profile.ProfileString ?? "" },
                        { "material", beam.Material.MaterialString ?? "" },
                        { "startX", beam.StartPoint.X },
                        { "startY", beam.StartPoint.Y },
                        { "startZ", beam.StartPoint.Z },
                        { "endX", beam.EndPoint.X },
                        { "endY", beam.EndPoint.Y },
                        { "endZ", beam.EndPoint.Z },
                        { "class", beam.Class ?? "" }
                    });
                }
            }
            catch (Exception ex)
            {
                result.Add(new Dictionary<string, object>
                {
                    { "error", ex.Message }
                });
            }
            return result;
        }
    }
  `
});

const getAllColumns = edge.func({
  references: TEKLA_REFS,
  source: `
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Tekla.Structures.Model;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            var result = new List<Dictionary<string, object>>();
            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return result;

                var enumerator = model.GetModelObjectSelector()
                    .GetAllObjectsWithType(ModelObject.ModelObjectEnum.BEAM);

                while (enumerator.MoveNext())
                {
                    var beam = enumerator.Current as Beam;
                    if (beam == null) continue;
                    if (beam.Name != "COLUMN") continue;

                    result.Add(new Dictionary<string, object>
                    {
                        { "id", beam.Identifier.ID },
                        { "name", beam.Name },
                        { "profile", beam.Profile.ProfileString ?? "" },
                        { "material", beam.Material.MaterialString ?? "" },
                        { "startX", beam.StartPoint.X },
                        { "startY", beam.StartPoint.Y },
                        { "startZ", beam.StartPoint.Z },
                        { "endX", beam.EndPoint.X },
                        { "endY", beam.EndPoint.Y },
                        { "endZ", beam.EndPoint.Z },
                        { "class", beam.Class ?? "" }
                    });
                }
            }
            catch (Exception ex)
            {
                result.Add(new Dictionary<string, object>
                {
                    { "error", ex.Message }
                });
            }
            return result;
        }
    }
  `
});

const getAllObjects = edge.func({
  references: TEKLA_REFS,
  source: `
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Tekla.Structures.Model;

    public class Startup
    {
        public async Task<object> Invoke(object input)
        {
            var result = new List<Dictionary<string, object>>();
            try
            {
                var model = new Model();
                if (!model.GetConnectionStatus())
                    return result;

                var enumerator = model.GetModelObjectSelector()
                    .GetAllObjectsWithType(ModelObject.ModelObjectEnum.BEAM);

                while (enumerator.MoveNext())
                {
                    var obj = enumerator.Current as Beam;
                    if (obj == null) continue;

                    var name = (obj.Name ?? "").ToUpper();
                    var material = (obj.Material.MaterialString ?? "").ToUpper();
                    var profile = (obj.Profile.ProfileString ?? "").ToUpper();

                    if (name == "COLUMN" || name == "PLATE") continue;
                    if (material.StartsWith("C") && material.Length > 1 && char.IsDigit(material[1])) continue;
                    if (material.Contains("HORMIGON") || material.Contains("CONCRETE")) continue;
                    if (profile.StartsWith("PL")) continue;

                    result.Add(new Dictionary<string, object>
                    {
                        { "id", obj.Identifier.ID },
                        { "name", obj.Name },
                        { "type", "BEAM" },
                        { "profile", obj.Profile.ProfileString ?? "" },
                        { "material", obj.Material.MaterialString ?? "" },
                        { "startX", obj.StartPoint.X },
                        { "startY", obj.StartPoint.Y },
                        { "startZ", obj.StartPoint.Z },
                        { "endX", obj.EndPoint.X },
                        { "endY", obj.EndPoint.Y },
                        { "endZ", obj.EndPoint.Z },
                        { "class", obj.Class ?? "" }
                    });
                }
            }
            catch (Exception ex)
            {
                result.Add(new Dictionary<string, object>
                {
                    { "error", ex.Message }
                });
            }
            return result;
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
  getAllBeams: promisify(getAllBeams),
  getAllColumns: promisify(getAllColumns),
  getAllObjects: promisify(getAllObjects),
};
