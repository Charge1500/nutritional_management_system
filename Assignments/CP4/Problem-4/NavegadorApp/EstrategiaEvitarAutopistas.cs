using System.Collections.Generic;
using Contratos;

namespace NavegadorApp
{
    public class EstrategiaEvitarAutopistas : IEstrategiaRuta
    {
        public Ruta Calcular(Punto origen, Punto destino)
        {
            Ruta ruta = new Ruta();
            ruta.Puntos = new List<Punto> { origen, destino };
            ruta.DistanciaKm = origen.DistanciaA(destino) * 1.15; // 15% más distancia
            ruta.Minutos = ruta.DistanciaKm / 70.0 * 60.0; // 70 km/h
            return ruta;
        }
    }
}