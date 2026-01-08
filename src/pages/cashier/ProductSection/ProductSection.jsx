import { Input } from "@/components/ui/input";
import { Barcode, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { productAPI } from "@/services/api";
import { useCart } from "@/contexts/CartContext";

const ProductSection = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: This requires authentication. For now, we'll try without storeId
      // You may need to get storeId from user context or localStorage
      const data = await productAPI.getAll();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      // Fallback to empty array or mock data for development
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower) ||
      product.category?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // F1 hotkey for barcode scanning - focus search input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="barcode"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle barcode scanning - when barcode is entered, search and add to cart
  useEffect(() => {
    if (search.trim() && search.length >= 3) {
      // If search looks like a barcode (numeric/alphanumeric), try to find product by SKU
      const product = products.find(
        (p) => p.sku?.toLowerCase() === search.toLowerCase()
      );
      if (product) {
        addToCart(product);
        setSearch(''); // Clear search after adding
      }
    }
  }, [search, products, addToCart]);

  const handleScanClick = () => {
    const searchInput = document.querySelector('input[placeholder*="barcode"]');
    if (searchInput) {
      searchInput.focus();
      // In a real implementation, this would trigger camera/scanner
      alert('Barcode scanner ready. Enter barcode in search field or use F1 key.');
    }
  };

  return (
    <div className="w-full lg:w-2/5 flex flex-col bg-card border-r border-border min-h-0">
      <div className="border-b bg-muted shrink-0">
        <div className="p-3 sm:p-4 lg:px-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products or scan barcode (F1)"
              className="py-3 sm:py-4 pr-10 text-sm sm:text-base"
              onChange={handleSearchChange}
              value={search}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="flex items-center justify-between mt-3 sm:mt-4 flex-wrap gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleScanClick}
              title="Press F1 to focus search for barcode scanning"
            >
              <Barcode className="size-4" />
              <span className="hidden sm:inline">Scan (F1)</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-sm sm:text-base text-muted-foreground">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-sm sm:text-base text-destructive text-center">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-sm sm:text-base text-muted-foreground text-center">
              {search ? 'No products found matching your search' : 'No products available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onClick={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSection;
