using System.Collections.Generic;
using Contratos;

namespace PluginTuristica
{
    // Solo referencia el proyecto Contratos: cumple el contrato con IEstrategiaRuta del equipo
    public class EstrategiaTuristicaPanoramica : IEstrategiaRuta
    {
        public Ruta Calcular(Punto origen, Punto destino)
        {
            Ruta ruta = new Ruta();
            // Algoritmo  que simula pasar por tres miradores panorámicos intermedios entre el origen y el destino
            Punto mirador1 = new Punto(
                origen.X + (destino.X - origen.X) * 0.25 + 10,
                origen.Y + (destino.Y - origen.Y) * 0.25);
            Punto mirador2 = new Punto(
                origen.X + (destino.X - origen.X) * 0.5,
                origen.Y + (destino.Y - origen.Y) * 0.5 + 15);
            Punto mirador3 = new Punto(
                origen.X + (destino.X - origen.X) * 0.75 - 8,
                origen.Y + (destino.Y - origen.Y) * 0.75);

            ruta.Puntos = new List<Punto> { origen, mirador1, mirador2, mirador3, destino };
            ruta.DistanciaKm = 0;
            for (int i = 0; i < ruta.Puntos.Count - 1; i++)
            {
                ruta.DistanciaKm += ruta.Puntos[i].DistanciaA(ruta.Puntos[i + 1]);
            }
            // Más lenta: velocidad media baja por carretera panorámica.
            ruta.Minutos = ruta.DistanciaKm / 60.0 * 60.0;
            return ruta;
        }
    }
}
