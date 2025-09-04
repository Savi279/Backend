import UserColorProfile from '../models/UserColorProfile.js';

// Dummy color palettes for demonstration
const colorPalettes = {
  warm: [
    { name: 'Coral', hex: '#FF7F50' },
    { name: 'Olive Green', hex: '#808000' },
    { name: 'Terracotta', hex: '#E2725B' },
    { name: 'Mustard Yellow', hex: '#FFDB58' },
  ],
  cool: [
    { name: 'Navy Blue', hex: '#000080' },
    { name: 'Emerald Green', hex: '#50C878' },
    { name: 'Lavender', hex: '#E6E6FA' },
    { name: 'Silver', hex: '#C0C0C0' },
  ],
  neutral: [
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Grey', hex: '#808080' },
    { name: 'Cream', hex: '#FFFDD0' },
    { name: 'Taupe', hex: '#483C32' },
  ],
};

// Simple rule-based logic for color analysis
const getSuggestedColors = (skinTone, hairColor, eyeColor) => {
  let suggestedPalette = [];

  // Basic logic: prioritize skin tone, then consider hair/eye color
  if (skinTone === 'fair' || skinTone === 'light') {
    if (hairColor === 'blonde' || hairColor === 'red' || eyeColor === 'blue' || eyeColor === 'green') {
      suggestedPalette = colorPalettes.cool;
    } else {
      suggestedPalette = colorPalettes.neutral;
    }
  } else if (skinTone === 'medium' || skinTone === 'tan') {
    if (hairColor === 'brown' || hairColor === 'black' || eyeColor === 'brown' || eyeColor === 'hazel') {
      suggestedPalette = colorPalettes.warm;
    } else {
      suggestedPalette = colorPalettes.neutral;
    }
  } else if (skinTone === 'dark') {
    suggestedPalette = colorPalettes.warm.concat(colorPalettes.cool); // Both can work well
  }

  // Add some neutrals always
  suggestedPalette = suggestedPalette.concat(colorPalettes.neutral);

  // Remove duplicates if any (based on hex code)
  const uniqueColors = [];
  const seenHex = new Set();
  for (const color of suggestedPalette) {
    if (!seenHex.has(color.hex)) {
      uniqueColors.push(color);
      seenHex.add(color.hex);
    }
  }

  return uniqueColors;
};

// @desc    Analyze user colors and save profile
// @route   POST /api/color-analysis
// @access  Private
const analyzeColors = async (req, res) => {
  const { skinTone, hairColor, eyeColor } = req.body;

  // Basic validation
  if (!skinTone || !hairColor || !eyeColor) {
    return res.status(400).json({ msg: 'Please provide skin tone, hair color, and eye color' });
  }

  try {
    const suggestedColors = getSuggestedColors(skinTone, hairColor, eyeColor);

    let userColorProfile = await UserColorProfile.findOne({ user: req.user.id });

    if (userColorProfile) {
      // Update existing profile
      userColorProfile.skinTone = skinTone;
      userColorProfile.hairColor = hairColor;
      userColorProfile.eyeColor = eyeColor;
      userColorProfile.suggestedColors = suggestedColors;
      userColorProfile.analysisDate = Date.now();
    } else {
      // Create new profile
      userColorProfile = new UserColorProfile({
        user: req.user.id,
        skinTone,
        hairColor,
        eyeColor,
        suggestedColors,
      });
    }

    await userColorProfile.save();

    res.json(userColorProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user's color profile
// @route   GET /api/color-analysis
// @access  Private
const getUserColorProfile = async (req, res) => {
  try {
    const userColorProfile = await UserColorProfile.findOne({ user: req.user.id });

    if (!userColorProfile) {
      return res.status(404).json({ msg: 'Color profile not found for this user' });
    }

    res.json(userColorProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export { analyzeColors, getUserColorProfile };
