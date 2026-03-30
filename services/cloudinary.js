const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'onpurpose',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

class CloudinaryService {
  // Upload single image
  async uploadImage(file, folder = 'general') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `onpurpose/${folder}`,
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Upload profile image with specific transformations
  async uploadProfileImage(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'onpurpose/profiles',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }
  }

  // Upload host gallery images
  async uploadHostGallery(files) {
    try {
      const uploadPromises = files.map(file => 
        cloudinary.uploader.upload(file.path, {
          folder: 'onpurpose/host-gallery',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        })
      );

      const results = await Promise.all(uploadPromises);
      return results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }));
    } catch (error) {
      throw new Error(`Failed to upload gallery images: ${error.message}`);
    }
  }

  // Delete image by public ID
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  // Get optimized image URL
  getOptimizedUrl(publicId, options = {}) {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto'
    };
    
    const transformOptions = { ...defaultOptions, ...options };
    
    return cloudinary.url(publicId, transformOptions);
  }

  // Generate thumbnail
  getThumbnail(publicId, width = 150, height = 150) {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }

  // Generate responsive image URLs
  getResponsiveUrls(publicId) {
    const sizes = [
      { width: 400, suffix: 'sm' },
      { width: 800, suffix: 'md' },
      { width: 1200, suffix: 'lg' },
      { width: 1600, suffix: 'xl' }
    ];

    return sizes.reduce((urls, size) => {
      urls[size.suffix] = cloudinary.url(publicId, {
        width: size.width,
        crop: 'scale',
        quality: 'auto',
        fetch_format: 'auto'
      });
      return urls;
    }, {});
  }
}

// Multer middleware configurations
const uploadMiddleware = {
  single: (fieldName) => upload.single(fieldName),
  multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  fields: (fields) => upload.fields(fields)
};

module.exports = {
  cloudinaryService: new CloudinaryService(),
  uploadMiddleware,
  cloudinary
};
