using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using Contratos;

namespace NavegadorApp
{
    // Entrada del archivo de configuración estrategias.json
    public class ConfigEstrategia
    {
        public string Nombre { get; set; }
        public string TipoCompleto { get; set; }  // "Namespace.Clase, Ensamblado"
        public string Dll { get; set; }            // opcional: DLL externa (plugin)
    }

    public class ConfigEstrategias
    {
        public List<ConfigEstrategia> Estrategias { get; set; }
    }

    // Cargador por reflexión con Type.GetType(nombreClase) + Activator.CreateInstance(tipo)
    // Ampliado para plugins externos: si la entrada declara una DLL, primero se carga el ensamblado con Assembly.LoadFrom y 
    // después se obtiene el tipo desde ese ensamblado
    public class CargadorEstrategias
    {
        public static Dictionary<string, IEstrategiaRuta> CargarTodas(string rutaJson)
        {
            var resultado = new Dictionary<string, IEstrategiaRuta>();

            string json = File.ReadAllText(rutaJson);
            var opciones = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            ConfigEstrategias config = JsonSerializer.Deserialize<ConfigEstrategias>(json, opciones);

            foreach (ConfigEstrategia e in config.Estrategias)
            {
                IEstrategiaRuta estrategia = CargarUna(e);
                if (estrategia != null)
                {
                    resultado[e.Nombre] = estrategia;
                }
            }
            return resultado;
        }

        // Carga una estrategia a partir de una entrada del JSON.
        public static IEstrategiaRuta CargarUna(ConfigEstrategia e)
        {
            Type tipo = null;

            if (!string.IsNullOrEmpty(e.Dll))
            {
                // Plugin externo: cargar la DLL y buscar el tipo dentro de ella.
                string rutaDll = Path.Combine(AppContext.BaseDirectory, e.Dll);
                if (!File.Exists(rutaDll))
                {
                    Console.WriteLine($"[Cargador] No se encontró la DLL del plugin: {rutaDll}");
                    return null;
                }
                Assembly ensamblado = Assembly.LoadFrom(rutaDll);
                // El nombre del tipo dentro del ensamblado
                string nombreTipo = e.TipoCompleto.Split(',')[0].Trim();
                tipo = ensamblado.GetType(nombreTipo);
            }
            else
            {
                // Estrategia del propio ensamblado base 
                tipo = Type.GetType(e.TipoCompleto);
            }

            if (tipo == null)
            {
                Console.WriteLine($"[Cargador] No se encontró el tipo {e.TipoCompleto}");
                return null;
            }

            // Verificar que el tipo cumple el contrato compartido
            if (!typeof(IEstrategiaRuta).IsAssignableFrom(tipo))
            {
                Console.WriteLine($"[Cargador] {tipo.FullName} no implementa IEstrategiaRuta");
                return null;
            }

            // Crear la instancia por reflexión 
            object instancia = Activator.CreateInstance(tipo);
            Console.WriteLine($"[Cargador] Estrategia '{e.Nombre}' cargada: {tipo.FullName} desde {tipo.Assembly.GetName().Name}");
            return (IEstrategiaRuta)instancia;
        }
    }
}
