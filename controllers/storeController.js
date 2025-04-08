exports.getIndex = (req,res,next) => {
 
  res.render('store/index',{ pageTitle : 'Naysan Home Health Care'});
}

exports.getServices = (req,res,next) => {
 
  res.render('store/services',{ pageTitle : 'Naysan Home Health Care'});
}