//core module
const path = require('path');

//External Modules
const express = require('express');

const storeController = require('./../controllers/storeController');
const { serviceUpload } = require('../middleware/uploadConfig');

const storeRouter = express.Router();

// for admin site API's
//for services
storeRouter.get("/services/service-list",storeController.getAllServices);
storeRouter.post("/services/add-service", serviceUpload.single('service_image'), storeController.postAddService);
storeRouter.delete("/services/delete-service", storeController.deleteService);

//for blogs
storeRouter.get("/blogs/blog-list",storeController.getAllBlogs);
storeRouter.post("/blogs/add-blog", serviceUpload.single('blog_image'), storeController.postAddBlog);
storeRouter.delete("/blogs/delete-blog", storeController.deleteBlog);

// for frontend(App) site API's

module.exports = storeRouter;