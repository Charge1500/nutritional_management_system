
using Pregunta4DIP.Core;

namespace Pregunta4DIP.Tests;

public class FakeAddressValidator : IAddressValidator
{
    private readonly bool _isValid;

    public FakeAddressValidator(bool isValid)
    {
        _isValid = isValid;
    }

    public Task<bool> IsValidAsync(string address)
    {
        return Task.FromResult(_isValid);
    }
}
