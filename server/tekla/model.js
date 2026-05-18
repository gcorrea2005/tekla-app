const edge = require('edge-js');
const path = require('path');

const TEKLA_BIN = process.env.TEKLA_BIN_PATH ||
  'C:\\Program Files\\Tekla Structures\\2020.0\\nt\\bin';

edge.assemblies([
  path.join(TEKLA_BIN, 'Tekla.Structures.Model.dll'),
  path.join(TEKLA_BIN, 'Tekla.Structures.Geometry3d.Compatibility.dll'),
]);

const getAllBeams = edge.func({
  source: function () {/*
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

                    var item = new Dictionary<string, object>
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
                    };
                    result.Add(item);
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
  */}
});

const getAllColumns = edge.func({
  source: function () {/*
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
                    .GetAllObjectsWithType(ModelObject.ModelObjectEnum.COLUMN);

                while (enumerator.MoveNext())
                {
                    var col = enumerator.Current as Beam;
                    if (col == null) continue;

                    var item = new Dictionary<string, object>
                    {
                        { "id", col.Identifier.ID },
                        { "name", col.Name },
                        { "profile", col.Profile.ProfileString ?? "" },
                        { "material", col.Material.MaterialString ?? "" },
                        { "startX", col.StartPoint.X },
                        { "startY", col.StartPoint.Y },
                        { "startZ", col.StartPoint.Z },
                        { "endX", col.EndPoint.X },
                        { "endY", col.EndPoint.Y },
                        { "endZ", col.EndPoint.Z },
                        { "class", col.Class ?? "" }
                    };
                    result.Add(item);
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
  */}
});

const getAllObjects = edge.func({
  source: function () {/*
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

                var types = new[]
                {
                    ModelObject.ModelObjectEnum.BEAM,
                    ModelObject.ModelObjectEnum.COLUMN
                };

                foreach (var type in types)
                {
                    var enumerator = model.GetModelObjectSelector()
                        .GetAllObjectsWithType(type);

                    while (enumerator.MoveNext())
                    {
                        var obj = enumerator.Current as Beam;
                        if (obj == null) continue;

                        result.Add(new Dictionary<string, object>
                        {
                            { "id", obj.Identifier.ID },
                            { "name", obj.Name },
                            { "type", type.ToString() },
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
  */}
});

module.exports = { getAllBeams, getAllColumns, getAllObjects };
