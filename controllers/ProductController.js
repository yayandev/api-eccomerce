import cloudinary from "../utils/cloudinary.js";
import prisma from "../utils/prisma.js";

export const getProducts = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 10;

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        discountPercentage: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        imagesUrl: true,
      },
      skip,
      take,
    });

    const totalProducts = await prisma.product.count();

    return res.status(200).json({
      success: true,
      message: "Products found",
      products,
      totalProducts,
      take,
      skip,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            comment: true,
            rating: true,
            created_at: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product found",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      discountPercentage,
      options,
      stock,
    } = req.body;
    const user_id = req.user.id;
    const imagesUrl = [];
    const imagesFile = [];

    req?.files.forEach((file) => {
      imagesUrl.push(file.path);
      imagesFile.push(file.filename);
    });

    if (!name || !description || !price || !category_id || !stock) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let slug = name.toLowerCase().replace(/ /g, "-");

    const productExists = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (productExists) {
      slug = slug + "-" + Math.floor(Math.random() * 10000);
    }

    let priceFloat = parseFloat(price);
    let discountPercentageInt = parseInt(discountPercentage);
    let stockInt = parseInt(stock);

    let dataOptions = null;
    if (options) {
      dataOptions = JSON.parse(options);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: priceFloat,
        category_id,
        user_id,
        imagesUrl,
        imagesFile,
        slug,
        discountPercentage: discountPercentageInt,
        options: dataOptions,
        stock: stockInt,
      },
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product not created",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product created",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category_id,
      stock,
      discountPercentage,
      options,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !category_id ||
      !stock ||
      !discountPercentage
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let priceFloat = parseFloat(price);
    let discountPercentageInt = parseInt(discountPercentage);
    let stockInt = parseInt(stock);

    let dataOptions = null;
    if (options) {
      dataOptions = JSON.parse(options);
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (name !== product.name) {
      let slug = name.toLowerCase().replace(/ /g, "-");

      const productExists = await prisma.product.findUnique({
        where: {
          slug,
        },
      });

      if (productExists) {
        slug = slug + "-" + Math.floor(Math.random() * 10000);
      }

      product.slug = slug;
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        price: priceFloat,
        category_id,
        slug: product.slug,
        discountPercentage: discountPercentageInt,
        options: dataOptions,
        stock: stockInt,
      },
    });

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        reviews: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const imagesFile = product.imagesFile;
    const reviews = product.reviews;

    if (reviews.length > 0) {
      reviews.map(async (review) => {
        await prisma.review.delete({
          where: {
            id: review.id,
          },
        });
      });
    }

    const deletedProduct = await prisma.product.delete({
      where: {
        id,
      },
    });

    if (!deletedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product not deleted",
      });
    }

    if (imagesFile) {
      imagesFile.map(async (image) => {
        const destroy = await cloudinary.uploader.destroy(image);
        console.log(`destroy ${image} : ${destroy}`);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted",
      deletedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteImageProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const body = req.body;

    const { imageUrl, imageFile } = body;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const imagesFile = product.imagesFile.filter(
      (image) => image !== imageFile
    );
    const imagesUrl = product.imagesUrl.filter((image) => image !== imageUrl);

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        imagesFile,
        imagesUrl,
      },
    });

    const deleteImage = await cloudinary.uploader.destroy(imageFile);

    if (!deleteImage) {
      return res.status(400).json({
        success: false,
        message: "Image not deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted",
      updatedProduct,
      deleteImage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addImageProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "File not found",
      });
    }

    const imagesUrl = product.imagesUrl;
    const imagesFile = product.imagesFile;

    req.files.map((file) => {
      imagesUrl.push(file.path);
      imagesFile.push(file.filename);
    });

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        imagesUrl,
        imagesFile,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Image added",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { q } = req.params;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
    });

    return res.status(200).json({
      success: true, // Perbaiki typo
      message: "Products found",
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false, // Perbaiki typo
      message: "Internal Server Error",
    });
  }
};
