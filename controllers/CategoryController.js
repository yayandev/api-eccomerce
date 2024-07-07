import prisma from "../utils/prisma.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.status(200).json({
      success: true,
      message: "Categories found",
      categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Category found",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user_id = req.user.id;
    let slug;
    slug = name.toLowerCase().replace(/ /g, "-");

    const categoryExists = await prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (categoryExists) {
      slug = slug + "-" + Math.floor(Math.random() * 10000);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        user_id,
      },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not created",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Category created successsfully",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.user_id !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (name !== category.name) {
      let slug = name.toLowerCase().replace(/ /g, "-");

      const categoryExists = await prisma.category.findUnique({
        where: {
          slug,
        },
      });

      if (categoryExists) {
        slug = slug + "-" + Math.floor(Math.random() * 10000);
      }

      category.slug = slug;
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug: category.slug,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successsfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.user_id !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const deletedCategory = await prisma.category.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successsfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
