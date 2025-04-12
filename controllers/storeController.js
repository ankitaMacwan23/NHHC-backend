<<<<<<< HEAD
const Service = require('../models/service'); 
const Blog = require('../models/blog'); 

//--------------------for admin site functions--------------------------------------

//for services(admin)
exports.getAllServices = async (req,res) => {
  try {
    const services = await Service.find();
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
}

exports.postAddService = async (req, res) => {
  try {
    const { service_name, service_desc, price, category, status } = req.body;

    // Get uploaded file info
    const service_image = req.file ? `/uploads/services/${req.file.filename}` : null;

    if (!service_name || !service_desc || !price || !category || !service_image) {
      return res.status(400).json({ success: false, message: 'All fields including image are required.' });
    }

    const newService = new Service({
      service_name,
      service_image,
      service_desc,
      price,
      category,
      status
    });

    await newService.save();
    return res.status(201).json({ success: true, message: 'Service added successfully!' });
  } catch (error) {
    console.error('Error adding service:', error);
    return res.status(500).json({ success: false, message: 'There was an error while adding the service.' });
  }
};

exports.deleteService = async (req,res) => {
  const { id } = req.body;
  try {
    await Service.findByIdAndDelete(id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Deletion failed', error: err.message });
  }
}

//for blogs(admin)
exports.deleteBlog = async (req,res) => {
  const { id } = req.body;
  try {
    await Blog.findByIdAndDelete(id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Deletion failed', error: err.message });
  }
}

exports.getAllBlogs = async (req,res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
  }
}

exports.postAddBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      category,
      status
    } = req.body;

    // Check for required fields
    if (!title || !content || !author || !category) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    // Get image path if file is uploaded
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/blogs/${req.file.filename}`; // or just req.file.path depending on how uploads are set up
    }

    // Set published_at if status is 'published'
    const publishedAt = status === 'published' ? new Date() : null;

    const newBlog = new Blog({
      title,
      content,
      author,
      image: imagePath,
      category,
      status,
      published_at: publishedAt
    });

    await newBlog.save();

    return res.status(201).json({ success: true, message: "Blog added successfully", blog: newBlog });

  } catch (error) {
    console.error("Error adding blog:", error);
    return res.status(500).json({ success: false, message: "Server error while adding blog." });
  }
};

//--------------------------for frontend(App) Functions------------------------------







=======
exports.getIndex = (req,res,next) => {
 
  res.render('store/index',{ pageTitle : 'Naysan Home Health Care'});
}

exports.getServices = (req,res,next) => {
 
  res.render('store/services',{ pageTitle : 'Naysan Home Health Care'});
}
>>>>>>> 4c41389958edadc7fa3029204947fa161358c254
