export const sendPlaceholder = (res, feature) => {
  res.json({
    message: `${feature} route ready for implementation`,
  });
};
