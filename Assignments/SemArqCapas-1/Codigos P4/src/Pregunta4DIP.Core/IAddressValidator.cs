namespace Pregunta4DIP.Core;

//es el puerto
//Define que operacion necesita el negocio
public interface IAddressValidator
{
    Task<bool> IsValidAsync(string address);
}