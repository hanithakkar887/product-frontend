import { useEffect, useState } from "react"
import axios from "axios"
import { 
  Search, 
  Package, 
  DollarSign, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Edit3,
  Tag,
  Box,
  Cpu,
  HardDrive,
  Palette,
  Monitor,
  Sparkles,
  ShoppingBag,
  PieChart,
  X,
  Database,
  AlertCircle
} from "lucide-react"
import "./App.css"

function App() {
  const API = "https://product-ranking.onrender.com"

  const [allProducts, setAllProducts] = useState([]) // Store ALL products
  const [displayedProducts, setDisplayedProducts] = useState([]) // Products for current page
  const [query, setQuery] = useState("iphone")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [validationError, setValidationError] = useState("")
  const [addProductError, setAddProductError] = useState("")

  const PRODUCTS_PER_PAGE = 6

  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    rating: "",
    price: "",
    mrp: "",
    stock: "",
    sales: ""
  })

  const [meta, setMeta] = useState({
    productId: "",
    ram: "",
    storage: "",
    color: "",
    screen: ""
  })

  // Fetch ALL products from API (without pagination)
  const fetchAllProducts = () => {
    setLoading(true)
    // Fetch with a very high limit to get all products at once
    axios.get(`${API}/api/v1/search/product?query=${query}&page=1&limit=1000`)
      .then(res => {
        const data = res.data.data || []
        setAllProducts(data)
        setPage(1) // Reset to first page
        setLoading(false)
      })
      .catch(err => {
        console.log(err)
        setAllProducts([])
        setLoading(false)
      })
  }

  // Update displayed products when page or allProducts changes
  useEffect(() => {
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE
    const endIndex = startIndex + PRODUCTS_PER_PAGE
    setDisplayedProducts(allProducts.slice(startIndex, endIndex))
  }, [page, allProducts])

  // Fetch products on mount and when query changes
  useEffect(() => {
    fetchAllProducts()
  }, [])

  // Calculate total pages
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  // Validate Add Product inputs
  const validateAddProduct = () => {
    setAddProductError("")

    if (!newProduct.title.trim()) {
      setAddProductError("Title is required")
      return false
    }

    if (!newProduct.description.trim()) {
      setAddProductError("Description is required")
      return false
    }

    // Validate rating (must be between 0-5)
    const rating = parseFloat(newProduct.rating)
    if (!newProduct.rating || isNaN(rating) || rating < 0 || rating > 5) {
      setAddProductError("Rating must be a number between 0 and 5")
      return false
    }

    // Validate price (must be a positive number)
    const price = parseFloat(newProduct.price)
    if (!newProduct.price || isNaN(price) || price <= 0) {
      setAddProductError("Price must be a positive number")
      return false
    }

    // Validate MRP (must be a positive number)
    const mrp = parseFloat(newProduct.mrp)
    if (!newProduct.mrp || isNaN(mrp) || mrp <= 0) {
      setAddProductError("MRP must be a positive number")
      return false
    }

    // Validate stock (must be a positive integer)
    const stock = parseInt(newProduct.stock)
    if (!newProduct.stock || isNaN(stock) || stock < 0) {
      setAddProductError("Stock must be a non-negative integer")
      return false
    }

    // Validate sales (must be a non-negative integer)
    const sales = parseInt(newProduct.sales)
    if (!newProduct.sales || isNaN(sales) || sales < 0) {
      setAddProductError("Sales must be a non-negative integer")
      return false
    }

    return true
  }

  const addProduct = () => {
    if (!validateAddProduct()) {
      return
    }

    axios.post(`${API}/api/v1/product`, {
      ...newProduct,
      rating: parseFloat(newProduct.rating),
      price: parseFloat(newProduct.price),
      mrp: parseFloat(newProduct.mrp),
      stock: parseInt(newProduct.stock),
      sales: parseInt(newProduct.sales)
    })
      .then(() => {
        alert("Product added ✅")
        setAddProductError("")
        fetchAllProducts() // Refresh all products
        setNewProduct({
          title: "",
          description: "",
          rating: "",
          price: "",
          mrp: "",
          stock: "",
          sales: ""
        })
      })
      .catch(err => {
        console.log(err)
        setAddProductError(err.response?.data?.message || "Failed to add product")
      })
  }

  // Validate metadata inputs
  const validateMetadata = () => {
    setValidationError("")

    if (!meta.productId.trim()) {
      setValidationError("Product ID is required")
      return false
    }

    // Validate RAM format (e.g., "8GB", "16GB")
    const ramRegex = /^\d+GB$/i
    if (meta.ram && !ramRegex.test(meta.ram.trim())) {
      setValidationError("RAM format invalid. Example: 8GB, 16GB")
      return false
    }

    // Validate Storage format (e.g., "128GB", "256GB", "1TB")
    const storageRegex = /^\d+(GB|TB)$/i
    if (meta.storage && !storageRegex.test(meta.storage.trim())) {
      setValidationError("Storage format invalid. Example: 128GB, 256GB, 1TB")
      return false
    }

    // Validate Color (must be a valid color name)
    const colorRegex = /^[a-zA-Z\s]+$/
    if (meta.color && !colorRegex.test(meta.color.trim())) {
      setValidationError("Color must be text only. Example: red, blue, black")
      return false
    }

    // Validate Screen format (e.g., "6.1 inch", "6.7 inch")
    const screenRegex = /^\d+(\.\d+)?\s*(inch|inches)$/i
    if (meta.screen && !screenRegex.test(meta.screen.trim())) {
      setValidationError("Screen format invalid. Example: 6.1 inch, 6.7 inch")
      return false
    }

    return true
  }

  const updateMeta = () => {
    if (!validateMetadata()) {
      return
    }

    setIsUpdating(true)
    setValidationError("")

    axios.put(`${API}/api/v1/product/meta-data`, {
      productId: meta.productId.trim(),
      metadata: {
        ram: meta.ram.trim(),
        storage: meta.storage.trim(),
        color: meta.color.trim(),
        screen: meta.screen.trim()
      }
    })
      .then(() => {
        setTimeout(() => {
          alert("Metadata updated successfully! 🚀")
          fetchAllProducts() // Refresh all products
          setMeta({
            productId: "",
            ram: "",
            storage: "",
            color: "",
            screen: ""
          })
          setIsUpdating(false)
        }, 1000)
      })
      .catch(err => {
        console.log(err)
        setValidationError(err.response?.data?.message || "Failed to update metadata")
        setIsUpdating(false)
      })
  }

  // Calculate metadata statistics for selected product
  const getProductMetadataStats = (product) => {
    const metadata = product.metadata || {}
    return [
      { label: 'RAM', value: metadata.ram || 'N/A', color: '#667eea' },
      { label: 'Storage', value: metadata.storage || 'N/A', color: '#10b981' },
      { label: 'Color', value: metadata.color || 'N/A', color: '#f59e0b' },
      { label: 'Screen', value: metadata.screen || 'N/A', color: '#8b5cf6' }
    ]
  }

  // Calculate overall statistics (use ALL products, not just displayed ones)
  const getOverallStats = () => {
    const stats = {
      totalProducts: allProducts.length,
      avgRating: 0,
      avgPrice: 0,
      totalStock: 0,
      totalSales: 0
    }

    allProducts.forEach(p => {
      stats.avgRating += parseFloat(p.rating) || 0
      stats.avgPrice += parseFloat(p.price) || 0
      stats.totalStock += parseFloat(p.stock) || 0
      stats.totalSales += parseFloat(p.sales) || 0
    })

    if (allProducts.length > 0) {
      stats.avgRating = (stats.avgRating / allProducts.length).toFixed(1)
      stats.avgPrice = (stats.avgPrice / allProducts.length).toFixed(2)
    }

    return stats
  }

  const stats = getOverallStats()

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setPage(page - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchAllProducts()
  }

  return (
    <div className="app-container">
      
      {/* Animated Background Elements */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <div className="content-wrapper">
        
        {/* HEADER */}
        <div className="header-card animate-fadeInUp">
          <div className="header-content">
            <div>
              <h1 className="main-title">
                <ShoppingBag size={42} className="title-icon" />
                Product Hub
              </h1>
              <p className="subtitle">
                Manage your entire product catalog with ease
              </p>
            </div>
            <div className="header-actions">
              <div className="product-count-badge">
                <Package size={20} />
                {allProducts.length} Products
              </div>
              <button 
                className="chart-btn btn-hover"
                onClick={() => setShowChart(!showChart)}
              >
                <PieChart size={20} />
                View Overall Stats
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH SECTION */}
        <div className="search-card animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
          <div className="search-wrapper">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={24} />
              <input
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="search-input input-focus"
              />
            </div>
            <button
              onClick={handleSearch}
              className="search-btn btn-hover"
            >
              <Search size={20} /> Search
            </button>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="products-card animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          <div className="products-header">
            <h2 className="section-title">
              <Box className="section-icon" size={32} />
              Available Products
            </h2>
            <div className="pagination-controls">
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className={`pagination-btn btn-hover ${!hasPrevPage ? 'disabled' : ''}`}
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <div className="page-indicator">
                Page {page} of {totalPages || 1}
              </div>
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className={`pagination-btn btn-hover ${!hasNextPage ? 'disabled' : ''}`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="products-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="loading-shimmer product-skeleton"></div>
              ))}
            </div>
          // ) : displayedProducts.length === 0 ? (
          //   <div className="no-products">
          //     <Package size={64} color="#cbd5e1" />
          //     <p>No products found</p>
          //     <small style={{ color: '#94a3b8', marginTop: '10px' }}>
          //       Try searching for something else
          //     </small>
          //   </div>
          // ) : (
 ) : displayedProducts.length === 0 ? (

  <div className="no-products">
    <div className="empty-bag-container">
      <div className="shopping-bag">
        <ShoppingBag size={120} color="#cbd5e1" strokeWidth={1.5} />
      </div>

      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
      <div className="particle"></div>
    </div>

    <div className="empty-message">
      <h3 className="empty-title">No Products Found</h3>
      <p className="empty-subtitle">
        We couldn't find any products matching your search
      </p>
    </div>
  </div>

) : (
            <>
              <div className="products-grid">
                {displayedProducts.map((p, index) => (
                  <div key={p._id} className="product-card card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="rating-badge">
                      <Star size={16} fill="white" />
                      {p.rating}
                    </div>

                    <div className="product-icon-wrapper">
                      <Tag size={30} color="white" />
                    </div>

                    <h3 className="product-title">{p.title}</h3>
                    
                    <p className="product-description">{p.description}</p>
                    
                    <div className="product-price">
                      <DollarSign size={28} className="price-icon" />
                      <span className="price-value">{p.price}</span>
                    </div>
                    
                    <div className="product-id">
                      ID: {p._id}
                    </div>

                    {/* Metadata Button */}
                    <button 
                      className="metadata-btn btn-hover"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <Database size={18} />
                      View Metadata
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination Info */}
              {allProducts.length > PRODUCTS_PER_PAGE && (
                <div className="pagination-info-bottom">
                  Showing {((page - 1) * PRODUCTS_PER_PAGE) + 1} - {Math.min(page * PRODUCTS_PER_PAGE, allProducts.length)} of {allProducts.length} products
                </div>
              )}
            </>
          )}
        </div>

        {/* ADD & UPDATE SECTIONS */}
        <div className="form-sections">
          
          {/* ADD PRODUCT */}
          <div className={`form-card animate-slideInLeft ${isUpdating ? 'transparent-bg' : ''}`} style={{ animationDelay: "0.3s" }}>
            <h2 className="form-title">
              <div className="form-icon-wrapper green-gradient">
                <Plus size={24} color="white" />
              </div>
              Add Product
            </h2>

            {/* Validation Error */}
            {addProductError && (
              <div className="validation-error">
                <AlertCircle size={20} />
                {addProductError}
              </div>
            )}

            {/* Examples */}
            <div className="metadata-examples">
              <p className="example-title">📝 Required Fields & Examples:</p>
              <div className="examples-grid">
                <span><Tag size={14} /> Title: Required</span>
                <span><Box size={14} /> Description: Required</span>
                <span><Star size={14} /> Rating: 0-5 (e.g., 4.5)</span>
                <span><DollarSign size={14} /> Price: Number (e.g., 999)</span>
                <span><DollarSign size={14} /> MRP: Number (e.g., 1299)</span>
                <span><Package size={14} /> Stock: Integer (e.g., 50)</span>
                <span><ShoppingBag size={14} /> Sales: Integer (e.g., 25)</span>
              </div>
            </div>
            
            <div className="form-inputs">
              <input
                placeholder="Title (Required)"
                value={newProduct.title}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, title: e.target.value })
                  setAddProductError("")
                }}
                className="form-input input-focus"
              />
              <input
                placeholder="Description (Required)"
                value={newProduct.description}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, description: e.target.value })
                  setAddProductError("")
                }}
                className="form-input input-focus"
              />
              <input
                placeholder="Rating (0-5, e.g., 4.5)"
                value={newProduct.rating}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, rating: e.target.value })
                  setAddProductError("")
                }}
                className="form-input input-focus"
              />
              <input
                placeholder="Price (e.g., 999)"
                value={newProduct.price}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, price: e.target.value })
                  setAddProductError("")
                }}
                className="form-input input-focus"
              />
              <input
                placeholder="MRP (e.g., 1299)"
                value={newProduct.mrp}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, mrp: e.target.value })
                  setAddProductError("")
                }}
                className="form-input input-focus"
              />
              <input
                placeholder="Stock (e.g., 50)"
                value={newProduct.stock}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, stock: e.target.value })
                  setAddProductError("")
                }}
                className="form-input input-focus"
              />
              <input
                placeholder="Sales (e.g., 25)"
                value={newProduct.sales}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, sales: e.target.value })
                  setAddProductError("")
                }}
                className="form-input input-focus"
              />
            </div>
            
            <button
              onClick={addProduct}
              className="submit-btn green-btn btn-hover"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>

          {/* UPDATE METADATA */}
          <div className={`form-card animate-slideInLeft ${isUpdating ? 'updating' : ''}`} style={{ animationDelay: "0.4s" }}>
            <h2 className="form-title">
              <div className="form-icon-wrapper purple-gradient">
                <Edit3 size={24} color="white" />
              </div>
              Update Metadata
            </h2>

            {/* Validation Error */}
            {validationError && (
              <div className="validation-error">
                <AlertCircle size={20} />
                {validationError}
              </div>
            )}

            {/* Examples */}
            <div className="metadata-examples">
              <p className="example-title">📝 Valid Format Examples:</p>
              <div className="examples-grid">
                <span><Cpu size={14} /> RAM: 8GB, 16GB</span>
                <span><HardDrive size={14} /> Storage: 128GB, 1TB</span>
                <span><Palette size={14} /> Color: red, blue, black</span>
                <span><Monitor size={14} /> Screen: 6.1 inch, 6.7 inch</span>
              </div>
            </div>
            
            <div className="form-inputs">
              <input
                placeholder="Product ID (Required)"
                value={meta.productId}
                onChange={(e) => {
                  setMeta({ ...meta, productId: e.target.value })
                  setValidationError("")
                }}
                className="form-input input-focus"
              />
              
              <div className="input-with-icon">
                <Cpu className="input-icon" size={20} />
                <input
                  placeholder="RAM (e.g., 8GB, 16GB)"
                  value={meta.ram}
                  onChange={(e) => {
                    setMeta({ ...meta, ram: e.target.value })
                    setValidationError("")
                  }}
                  className="form-input input-focus with-icon"
                />
              </div>

              <div className="input-with-icon">
                <HardDrive className="input-icon" size={20} />
                <input
                  placeholder="Storage (e.g., 128GB, 256GB, 1TB)"
                  value={meta.storage}
                  onChange={(e) => {
                    setMeta({ ...meta, storage: e.target.value })
                    setValidationError("")
                  }}
                  className="form-input input-focus with-icon"
                />
              </div>

              <div className="input-with-icon">
                <Palette className="input-icon" size={20} />
                <input
                  placeholder="Color (e.g., red, blue, black)"
                  value={meta.color}
                  onChange={(e) => {
                    setMeta({ ...meta, color: e.target.value })
                    setValidationError("")
                  }}
                  className="form-input input-focus with-icon"
                />
              </div>

              <div className="input-with-icon">
                <Monitor className="input-icon" size={20} />
                <input
                  placeholder="Screen (e.g., 6.1 inch, 6.7 inch)"
                  value={meta.screen}
                  onChange={(e) => {
                    setMeta({ ...meta, screen: e.target.value })
                    setValidationError("")
                  }}
                  className="form-input input-focus with-icon"
                />
              </div>
            </div>
            
            <button
              onClick={updateMeta}
              className="submit-btn purple-btn btn-hover"
              disabled={isUpdating}
            >
              <Sparkles size={20} /> {isUpdating ? 'Updating...' : 'Update Metadata'}
            </button>
          </div>
        </div>

      </div>

      {/* OVERALL STATS MODAL */}
      {showChart && (
        <div className="modal-overlay" onClick={() => setShowChart(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <PieChart size={28} />
                Overall Product Statistics
              </h2>
              <button className="modal-close" onClick={() => setShowChart(false)}>
               c <X size={24} />
              </button>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue-gradient">
                  <Package size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value">{stats.totalProducts}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon yellow-gradient">
                  <Star size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Avg Rating</div>
                  <div className="stat-value">{stats.avgRating}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green-gradient">
                  <DollarSign size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Avg Price</div>
                  <div className="stat-value">${stats.avgPrice}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple-gradient">
                  <Box size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Stock</div>
                  <div className="stat-value">{stats.totalStock}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange-gradient">
                  <ShoppingBag size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Sales</div>
                  <div className="stat-value">{stats.totalSales}</div>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Rating Comparison (Top 6)</h3>
              <div className="bar-chart">
                {allProducts.slice(0, 6).map((p, index) => (
                  <div key={p._id} className="bar-item">
                    <div className="bar-label">{p.title.substring(0, 20)}...</div>
                    <div className="bar-wrapper">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${(parseFloat(p.rating) / 5) * 100}%`,
                          background: `linear-gradient(135deg, ${['#667eea', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'][index % 6]} 0%, ${['#764ba2', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2'][index % 6]} 100%)`
                        }}
                      >
                        <span className="bar-value">{p.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT METADATA MODAL */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content metadata-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Database size={28} />
                Product Metadata
              </h2>
              <button className="modal-close" onClick={() => setSelectedProduct(null)}>
               <X size={24} />c
              </button>
            </div>

            {/* Product Info */}
            <div className="product-info-section">
              <h3 className="product-modal-title">{selectedProduct.title}</h3>
              <p className="product-modal-desc">{selectedProduct.description}</p>
              <div className="product-modal-details">
                <span className="detail-badge price-badge-modal">
                  <DollarSign size={16} />
                  ${selectedProduct.price}
                </span>
                <span className="detail-badge rating-badge-modal">
                  <Star size={16} />
                  {selectedProduct.rating}
                </span>
              </div>
            </div>
            
            {/* Metadata Stats */}
            <div className="metadata-stats">
              {getProductMetadataStats(selectedProduct).map((stat, index) => (
                <div key={index} className="metadata-stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="metadata-stat-icon" style={{ background: stat.color }}>
                    {stat.label === 'RAM' && <Cpu size={24} color="white" />}
                    {stat.label === 'Storage' && <HardDrive size={24} color="white" />}
                    {stat.label === 'Color' && <Palette size={24} color="white" />}
                    {stat.label === 'Screen' && <Monitor size={24} color="white" />}
                  </div>
                  <div className="metadata-stat-info">
                    <div className="metadata-stat-label">{stat.label}</div>
                    <div className="metadata-stat-value">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pie Chart Visualization */}
            <div className="pie-chart-container">
              <h3 className="chart-title">Metadata Overview</h3>
              <div className="pie-chart">
                {getProductMetadataStats(selectedProduct).map((stat, index) => (
                  <div 
                    key={index} 
                    className="pie-segment"
                    style={{ 
                      background: stat.color,
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <div className="pie-label">{stat.label}</div>
                    <div className="pie-value">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App