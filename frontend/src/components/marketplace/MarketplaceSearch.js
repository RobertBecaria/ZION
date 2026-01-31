/**
 * MarketplaceSearch Component
 * Main search and browse page for marketplace
 */
import React, { useState, useEffect, useCallback } from 'react';
import { BACKEND_URL } from '../../config/api';
import { Search, Filter, Grid, List, Map as MapIcon, X, ChevronDown, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import MarketplaceProductCard from './MarketplaceProductCard';

// Custom marker icon
const productIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapController = ({ selectedProduct }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedProduct?.latitude && selectedProduct?.longitude) {
      map.flyTo([selectedProduct.latitude, selectedProduct.longitude], 14, { duration: 0.5 });
    }
  }, [map, selectedProduct]);

  return null;
};

const MarketplaceSearch = ({
  user,
  token,
  moduleColor = '#BE185D',
  onViewProduct,
  onCreateListing
}) => {
  const [categories, setCategories] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [cityFilter, setCityFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [mapCenter] = useState([55.7558, 37.6173]);
  const [selectedMapProduct, setSelectedMapProduct] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/marketplace/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || {});
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${BACKEND_URL}/api/marketplace/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFavorites(new Set(data.products?.map(p => p.id) || []));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };
    fetchFavorites();
  }, [token]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (cityFilter) params.append('city', cityFilter);
      if (conditionFilter) params.append('condition', conditionFilter);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      params.append('sort_by', sortBy);
      params.append('limit', '50');

      const response = await fetch(`${BACKEND_URL}/api/marketplace/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, cityFilter, conditionFilter, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleFavorite = async (productId) => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/marketplace/favorites/${productId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (data.is_favorite) {
            newSet.add(productId);
          } else {
            newSet.delete(productId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCityFilter('');
    setConditionFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  const productsWithCoords = products.map((p, idx) => ({
    ...p,
    latitude: p.latitude || (mapCenter[0] + (Math.random() - 0.5) * 0.1),
    longitude: p.longitude || (mapCenter[1] + (Math.random() - 0.5) * 0.1)
  }));

  return (
    <div className="marketplace-search">
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-top">
          <h1>Маркетплейс</h1>
          <button
            className="create-listing-btn"
            style={{ backgroundColor: moduleColor }}
            onClick={onCreateListing}
          >
            <Plus size={18} />
            Разместить объявление
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Фильтры
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Category */}
            <div className="filter-group">
              <label>Категория</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value || null);
                  setSelectedSubcategory(null);
                }}
              >
                <option value="">Все категории</option>
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {selectedCategory && categories[selectedCategory] && (
              <div className="filter-group">
                <label>Подкатегория</label>
                <select
                  value={selectedSubcategory || ''}
                  onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                >
                  <option value="">Все</option>
                  {categories[selectedCategory].subcategories?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* City */}
            <div className="filter-group">
              <label>Город</label>
              <input
                type="text"
                placeholder="Например: Москва"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>

            {/* Condition */}
            <div className="filter-group">
              <label>Состояние</label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
              >
                <option value="">Любое</option>
                <option value="new">Новый</option>
                <option value="like_new">Как новый</option>
                <option value="good">Хорошее</option>
                <option value="fair">Удовлетворительное</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group price-range">
              <label>Цена (₽)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="От"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filters-actions">
            <button className="clear-filters" onClick={clearFilters}>
              Сбросить фильтры
            </button>
          </div>
        </div>
      )}

      {/* Categories Quick Select */}
      <div className="categories-bar">
        <button
          className={`category-chip ${!selectedCategory ? 'active' : ''}`}
          onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); }}
          style={!selectedCategory ? { backgroundColor: moduleColor, color: 'white' } : {}}
        >
          Все
        </button>
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            className={`category-chip ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(key); setSelectedSubcategory(null); }}
            style={selectedCategory === key ? { backgroundColor: moduleColor, color: 'white' } : {}}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="results-header">
        <span className="results-count">Найдено: {total} товаров</span>
        
        <div className="results-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Сначала новые</option>
            <option value="price_asc">Сначала дешевые</option>
            <option value="price_desc">Сначала дорогие</option>
            <option value="popular">По популярности</option>
          </select>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
            <button
              className={viewMode === 'map' ? 'active' : ''}
              onClick={() => setViewMode('map')}
            >
              <MapIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" style={{ borderTopColor: moduleColor }}></div>
          <p>Загрузка товаров...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>Товары не найдены</h3>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="map-view-container">
          <MapContainer
            center={mapCenter}
            zoom={11}
            className="marketplace-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController selectedProduct={selectedMapProduct} />
            {productsWithCoords.map(product => (
              <Marker
                key={product.id}
                position={[product.latitude, product.longitude]}
                icon={productIcon}
                eventHandlers={{
                  click: () => setSelectedMapProduct(product)
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{product.title}</strong>
                    <p>{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(product.price)}</p>
                    <button onClick={() => onViewProduct(product)}>Подробнее</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Side list in map view */}
          <div className="map-sidebar">
            {products.map(product => (
              <div
                key={product.id}
                className={`map-product-item ${selectedMapProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMapProduct(product);
                }}
              >
                <div className="map-product-image">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="map-product-info">
                  <h4>{product.title}</h4>
                  <p style={{ color: moduleColor }}>
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`products-grid ${viewMode}`}>
          {products.map(product => (
            <MarketplaceProductCard
              key={product.id}
              product={product}
              onSelect={onViewProduct}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(product.id)}
              moduleColor={moduleColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceSearch;
