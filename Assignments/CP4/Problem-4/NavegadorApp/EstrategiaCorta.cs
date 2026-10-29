using System.Collections.Generic;
using Contratos;

namespace NavegadorApp
{
    public class EstrategiaCorta : IEstrategiaRuta
    {
        public Ruta Calcular(Punto origen, Punto destino)
        {
            Ruta ruta = new Ruta();
            ruta.Puntos = new List<Punto> { origen, destino };
            ruta.DistanciaKm = origen.DistanciaA(destino) * 0.85; // 15% menos distancia
            ruta.Minutos = ruta.DistanciaKm / 40.0 * 60.0; // 40 km/h en ciudad
            return ruta;
        }
    }
}