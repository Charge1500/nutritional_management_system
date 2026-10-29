using System.Collections.Generic;
using Contratos;

namespace NavegadorApp
{
    // Stub mínimo propio para probar el cargador para 4E
    // Las 5 estrategias oficiales (Rápida, Corta, EvitarAutopistas,EvitarPeajes, Ecológica) la implementa el compañero usando la misma interfaz IEstrategiaRuta
    public class EstrategiaRapida : IEstrategiaRuta
    {
        public Ruta Calcular(Punto origen, Punto destino)
        {
            Ruta ruta = new Ruta();
            ruta.Puntos = new List<Punto> { origen, destino };
            ruta.DistanciaKm = origen.DistanciaA(destino);
            ruta.Minutos = ruta.DistanciaKm / 120.0 * 60.0; // 120 km/h en autopista
            return ruta;
        }
    }
}
