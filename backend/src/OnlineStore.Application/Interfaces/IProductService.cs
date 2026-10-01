using OnlineStore.Application.DTOs.Product;

namespace OnlineStore.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto> CreateProductAsync(CreateProductDto productDto);
}
