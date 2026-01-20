import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Divider,
  Badge,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Favorite,
  Share,
  FilterList,
  MonetizationOn,
  TrendingUp,
  Star,
  LocalOffer,
} from '@mui/icons-material';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    fetch('/api/products', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setProducts(items);
        setFilteredProducts(items);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products', err);
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      });
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'mining', label: 'Mining Packages' },
    { value: 'trading', label: 'Trading Tools' },
    { value: 'education', label: 'Education' },
    { value: 'services', label: 'Services' },
    { value: 'staking', label: 'Staking' },
  ];

  const ProductCard = ({ product }) => (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
      onClick={() => handleProductClick(product)}
    >
      <Box position="relative">
        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.name}
        />
        {product.trending && (
          <Chip
            label="Trending"
            color="error"
            size="small"
            icon={<TrendingUp />}
            sx={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}
        {product.discount > 0 && (
          <Chip
            label={`-${product.discount}%`}
            color="success"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}
        {!product.inStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" color="white">
              Out of Stock
            </Typography>
          </Box>
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {product.name}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" ml={1}>
            ({product.reviews})
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={2} sx={{ flexGrow: 1 }}>
          {product.description}
        </Typography>
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" color="primary">
              ${product.price}
            </Typography>
            {product.originalPrice > product.price && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ textDecoration: 'line-through' }}
              >
                ${product.originalPrice}
              </Typography>
            )}
          </Box>
          <Chip
            label={`${product.commission}% Commission`}
            color="secondary"
            size="small"
            icon={<MonetizationOn />}
          />
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCart />}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          <Button variant="outlined" size="small">
            <Favorite />
          </Button>
          <Button variant="outlined" size="small">
            <Share />
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Product Catalog
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Discover our range of crypto and MLM products with attractive commission rates.
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
            startAdornment={<FilterList />}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No products found matching your criteria
          </Typography>
        </Box>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5">{selectedProduct.name}</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={selectedProduct.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2">({selectedProduct.reviews} reviews)</Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" mb={2}>
                    {selectedProduct.description}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h4" color="primary">
                      ${selectedProduct.price}
                    </Typography>
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <Typography 
                        variant="h6" 
                        color="text.secondary" 
                        sx={{ textDecoration: 'line-through' }}
                      >
                        ${selectedProduct.originalPrice}
                      </Typography>
                    )}
                    {selectedProduct.discount > 0 && (
                      <Chip label={`Save ${selectedProduct.discount}%`} color="success" />
                    )}
                  </Box>
                  
                  <Chip
                    label={`Earn ${selectedProduct.commission}% Commission`}
                    color="secondary"
                    icon={<MonetizationOn />}
                    sx={{ mb: 2 }}
                  />
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" mb={1}>Features:</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {selectedProduct.features.map((feature, index) => (
                      <Typography component="li" key={index} variant="body2" mb={0.5}>
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                disabled={!selectedProduct.inStock}
                size="large"
              >
                Add to Cart - ${selectedProduct.price}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProductCatalog;