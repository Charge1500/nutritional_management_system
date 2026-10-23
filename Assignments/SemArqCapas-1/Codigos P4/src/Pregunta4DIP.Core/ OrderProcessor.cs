
namespace Pregunta4DIP.Core;

//lógica de negocio de nuestro ejemplo y funcona sin conocer los detalles de HTTP.
public class OrderProcessor
{
    private readonly IAddressValidator _addressValidator;

    public OrderProcessor(IAddressValidator addressValidator)
    {
        _addressValidator = addressValidator;
    }

    public async Task ProcessOrderAsync(string address)
    {
        bool isValid = await _addressValidator.IsValidAsync(address);

        if (!isValid)
        {
            throw new ArgumentException(
                "La dirección del pedido no es válida.",
                nameof(address));
        }

        // Aquí continuaría el procesamiento del pedido.
    }
}
