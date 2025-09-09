import Favorites from '../models/Favorites.js';

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorites.findOne({ user: req.user.id }).populate('products');
    if (!favorites) {
      return res.json({ products: [] });
    }
    res.json(favorites.products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Toggle product in favorites (add if not present, remove if present)
// @route   POST /api/favorites/:productId
// @access  Private
const addToFavorites = async (req, res) => {
  const { productId } = req.params;

  try {
    let favorites = await Favorites.findOne({ user: req.user.id });

    if (favorites) {
      // Favorites exists, check if product is already in favorites
      const productIndex = favorites.products.findIndex(
        (p) => p.toString() === productId
      );

      if (productIndex > -1) {
        // Product already in favorites, remove it (toggle off)
        favorites.products.splice(productIndex, 1);
        await favorites.save();
      } else {
        // Product not in favorites, add it (toggle on)
        favorites.products.push(productId);
        await favorites.save();
      }
    } else {
      // No favorites for user, create new favorites with the product
      favorites = await Favorites.create({
        user: req.user.id,
        products: [productId],
      });
    }

    const populatedFavorites = await Favorites.findById(favorites._id).populate('products');
    res.json(populatedFavorites.products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Remove product from favorites
// @route   DELETE /api/favorites/:productId
// @access  Private
const removeFromFavorites = async (req, res) => {
  const { productId } = req.params;

  try {
    const favorites = await Favorites.findOne({ user: req.user.id });

    if (!favorites) {
      return res.status(404).json({ msg: 'Favorites not found' });
    }

    favorites.products = favorites.products.filter(
      (p) => p.toString() !== productId
    );

    await favorites.save();

    const populatedFavorites = await Favorites.findById(favorites._id).populate('products');
    res.json(populatedFavorites.products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export { getFavorites, addToFavorites, removeFromFavorites };
