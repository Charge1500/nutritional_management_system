
using System.Net.Http.Json;
using Pregunta4DIP.Core;

namespace Pregunta4DIP.Infrastructure;

public class HttpAddressValidatorAdapter : IAddressValidator
{
    private readonly HttpClient _httpClient;

    public HttpAddressValidatorAdapter(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> IsValidAsync(string address)
    {
        var response = await _httpClient.PostAsJsonAsync(
            "validate-address",
            new { address }
        );

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ValidationResponse>();

        return result?.IsValid ?? false;
    }

    private class ValidationResponse
    {
        public bool IsValid { get; set; }
    }
}
