const getSizeEquivalents = value => {
  if (value == 30 || value == 'XXS') {
    return ['XXS', 30];
  } else if (value == 32 || value == 'XS') {
    return ['XS', 32];
  } else if (value == 34 || value == 'S') {
    return ['S', 34];
  } else if (value == 36 || value == 'M') {
    return ['M', 36];
  } else if (value == 38 || value == 'L') {
    return ['L', 38];
  } else if (value == 40 || value == 'XL') {
    return ['XL', 40];
  } else if (value == 42 || value == 'XXL') {
    return ['XXL', 42];
  } else if (value == 44 || value == 'XXXL') {
    return ['XXXL', 44];
  } else if (value == 46 || value == 'XXXXL') {
    return ['4XL', 46];
  } else if (value == 48 || value == '5XL') {
    return ['5XL', 48];
  } else if (value == 50 || value == '6XL') {
    return ['6XL', 50];
  } else if (value == 52 || value == '7XL') {
    return ['7XL', 52];
  } else if (value == 54 || value == '8XL') {
    return ['8XL', 54];
  } else if (value == 56 || value == '9XL') {
    return ['9XL', 56];
  }
};

module.exports = {getSizeEquivalents};
