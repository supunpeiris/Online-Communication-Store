using OnlineStore.Application.DTOs.Product;

namespace OnlineStore.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto> UpdateProductAsync(int id, CreateProductDto dto);
    Task<bool> DeleteProductAsync(int id);
}
