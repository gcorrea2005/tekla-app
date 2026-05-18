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
        static List<Tuple<double, string>> _gridLevels = null;
        static double _neRef = double.NaN;

        static void LoadGridLevels(Model model)
        {
            if (_gridLevels != null) return;
            _gridLevels = new List<Tuple<double, string>>();
            try
            {
                var enumerator = model.GetModelObjectSelector().GetAllObjects();
                while (enumerator.MoveNext())
                {
                    var grid = enumerator.Current as Grid;
                    if (grid == null) continue;
                    var coordsStr = grid.CoordinateZ ?? "";
                    var labelsStr = grid.LabelZ ?? "";
                    var coords = coordsStr.Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries);
                    var labels = labelsStr.Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries);
                    for (int i = 0; i < Math.Min(coords.Length, labels.Length); i++)
                    {
                        double z;
                        if (double.TryParse(coords[i], out z))
                            _gridLevels.Add(Tuple.Create(z, labels[i].Trim()));
                    }
                }
                _gridLevels.Sort((a, b) => a.Item1.CompareTo(b.Item1));
            }
            catch { }
        }

        static double GetNE(Model model)
        {
            if (!double.IsNaN(_neRef)) return _neRef;
            LoadGridLevels(model);
            foreach (var lvl in _gridLevels)
            {
                if (lvl.Item2 == "N01")
                {
                    _neRef = lvl.Item1 - 100.0;
                    return _neRef;
                }
            }
            _neRef = 0.0;
            return _neRef;
        }

        static string GetLevel(double z, Model model)
        {
            LoadGridLevels(model);
            if (_gridLevels.Count == 0) return "";
            string best = _gridLevels[0].Item2;
            foreach (var lvl in _gridLevels)
            {
                if (z >= lvl.Item1 - 500) best = lvl.Item2;
                else break;
            }
            return best == "CUB" ? "N25" : best;
        }

        static string GetCota(double z, Model model)
        {
            double ne = GetNE(model);
            double diff = (z - ne) / 1000.0;
            string sign = diff >= 0 ? "+" : "-";
            return "NE" + sign + Math.Abs(diff).ToString("F2");
        }

        static string GetPartMark(Beam beam)
        {
            try
            {
                return beam.GetPartMark() ?? "";
            }
            catch { }
            return "";
        }

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

                    double z = beam.StartPoint.Z;
                    string partMark = GetPartMark(beam);

                    result.Add(new Dictionary<string, object>
                    {
                        { "id", beam.Identifier.ID },
                        { "name", beam.Name },
                        { "partMark", partMark },
                        { "level", GetLevel(z, model) },
                        { "cota", GetCota(z, model) },
                        { "profile", beam.Profile.ProfileString ?? "" },
                        { "material", beam.Material.MaterialString ?? "" },
                        { "startX", beam.StartPoint.X },
                        { "startY", beam.StartPoint.Y },
                        { "startZ", z },
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
        static List<Tuple<double, string>> _gridLevels = null;
        static double _neRef = double.NaN;

        static void LoadGridLevels(Model model)
        {
            if (_gridLevels != null) return;
            _gridLevels = new List<Tuple<double, string>>();
            try
            {
                var enumerator = model.GetModelObjectSelector().GetAllObjects();
                while (enumerator.MoveNext())
                {
                    var grid = enumerator.Current as Grid;
                    if (grid == null) continue;
                    var coordsStr = grid.CoordinateZ ?? "";
                    var labelsStr = grid.LabelZ ?? "";
                    var coords = coordsStr.Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries);
                    var labels = labelsStr.Split(new[]{' '}, StringSplitOptions.RemoveEmptyEntries);
                    for (int i = 0; i < Math.Min(coords.Length, labels.Length); i++)
                    {
                        double z;
                        if (double.TryParse(coords[i], out z))
                            _gridLevels.Add(Tuple.Create(z, labels[i].Trim()));
                    }
                }
                _gridLevels.Sort((a, b) => a.Item1.CompareTo(b.Item1));
            }
            catch { }
        }

        static double GetNE(Model model)
        {
            if (!double.IsNaN(_neRef)) return _neRef;
            LoadGridLevels(model);
            foreach (var lvl in _gridLevels)
            {
                if (lvl.Item2 == "N01")
                {
                    _neRef = lvl.Item1 - 100.0;
                    return _neRef;
                }
            }
            _neRef = 0.0;
            return _neRef;
        }

        static string GetLevel(double z, Model model)
        {
            LoadGridLevels(model);
            if (_gridLevels.Count == 0) return "";
            string best = _gridLevels[0].Item2;
            foreach (var lvl in _gridLevels)
            {
                if (z >= lvl.Item1 - 500) best = lvl.Item2;
                else break;
            }
            return best == "CUB" ? "N25" : best;
        }

        static string GetCota(double z, Model model)
        {
            double ne = GetNE(model);
            double diff = (z - ne) / 1000.0;
            string sign = diff >= 0 ? "+" : "-";
            return "NE" + sign + Math.Abs(diff).ToString("F2");
        }

        static string GetPartMark(Beam beam)
        {
            try
            {
                return beam.GetPartMark() ?? "";
            }
            catch { }
            return "";
        }

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

                    double z = obj.StartPoint.Z;
                    string partMark = GetPartMark(obj);

                    result.Add(new Dictionary<string, object>
                    {
                        { "id", obj.Identifier.ID },
                        { "name", obj.Name },
                        { "type", "BEAM" },
                        { "partMark", partMark },
                        { "level", GetLevel(z, model) },
                        { "cota", GetCota(z, model) },
                        { "profile", obj.Profile.ProfileString ?? "" },
                        { "material", obj.Material.MaterialString ?? "" },
                        { "startX", obj.StartPoint.X },
                        { "startY", obj.StartPoint.Y },
                        { "startZ", z },
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
