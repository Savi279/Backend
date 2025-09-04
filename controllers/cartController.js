import Cart from '../models/Cart.js';

// @desc    Get user's cart
// @route   GET /api/cart
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

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  const { productId, quantity, size } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      // Cart exists, check if product with the same size is already in cart
      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId && p.size === size
      );

      if (productIndex > -1) {
        // Product with the same size exists in cart, update quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        // Product does not exist in cart or has a different size, add new item
        cart.products.push({ product: productId, quantity, size });
      }
      await cart.save();
    } else {
      // No cart for user, create new cart
      cart = await Cart.create({
        user: req.user.id,
        products: [{ product: productId, quantity, size }],
      });
    }

    const populatedCart = await Cart.findById(cart._id).populate('products.product');

    res.json(populatedCart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId/:size
// @access  Private
const removeFromCart = async (req, res) => {
  const { productId, size } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      (p) => !(p.product.toString() === productId && p.size === size)
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('products.product');

    res.json(populatedCart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId/:size
// @access  Private
const updateCartItem = async (req, res) => {
  const { productId, size } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId && p.size === size
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      const populatedCart = await Cart.findById(cart._id).populate('products.product');
      res.json(populatedCart);
    } else {
      res.status(404).json({ msg: 'Product not found in cart' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export { getCart, addToCart, removeFromCart, updateCartItem };
