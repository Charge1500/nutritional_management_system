using Pregunta4DIP.Core;
using Xunit;

namespace Pregunta4DIP.Tests;

public class OrderProcessorTests
{
    [Fact]
    public async Task ProcessOrderAsync_ValidAddress_CompletesSuccessfully()
    {
        var validator = new FakeAddressValidator(true);
        var processor = new OrderProcessor(validator);

        var exception = await Record.ExceptionAsync(
            () => processor.ProcessOrderAsync("Calle 23, La Habana")
        );

        Assert.Null(exception);
    }

    [Fact]
    public async Task ProcessOrderAsync_InvalidAddress_ThrowsException()
    {
        var validator = new FakeAddressValidator(false);
        var processor = new OrderProcessor(validator);

        await Assert.ThrowsAsync<ArgumentException>(
            () => processor.ProcessOrderAsync("Dirección incorrecta")
        );
    }
}