exports.get404 = (req,res,next) => {
  res.statusCode = 404;
  res.render('store/404',{pageTitle : 'Page not found'});
  res.end();
}