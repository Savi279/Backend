import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @route   GET api/cart
// @desc    Get current user's cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('products.product');
    if (!cart) {
      return res.json({ products: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/cart
// @desc    Add item to cart or update quantity if exists
// @access  Private
const addItem = async (req, res) => {
  const { productId, quantity, size, price } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, products: [] });
    }

    // Check if product with same size exists in cart
    const existingItemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.products[existingItemIndex].quantity += quantity;
      // Update price if provided
      if (price !== undefined) {
        cart.products[existingItemIndex].price = price;
      }
    } else {
      // Add new item with size and price
      cart.products.push({ product: productId, quantity, size, price });
    }

    await cart.save();

    // Populate product details
    await cart.populate('products.product');

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/cart/:productId/:size
// @desc    Remove item from cart by productId and size
// @access  Private
const removeItem = async (req, res) => {
  const { productId, size } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      (item) => !(item.product.toString() === productId && item.size === size)
    );

    await cart.save();

    await cart.populate('products.product');

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/cart/:productId/:size
// @desc    Update quantity of a cart item
// @access  Private
const updateItem = async (req, res) => {
  const { productId, size } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    const item = cart.products.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (!item) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate('products.product');

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export { getCart, addItem as addToCart, removeItem, updateItem };
