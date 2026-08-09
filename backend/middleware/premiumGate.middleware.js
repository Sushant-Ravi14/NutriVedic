const premiumGate = (req, res, next) => {
  if (req.user && req.user.subscriptionTier === 'premium' && req.user.subscriptionActive) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      error: 'premium_required', 
      message: 'Upgrade to access this feature' 
    });
  }
};

module.exports = { premiumGate };
