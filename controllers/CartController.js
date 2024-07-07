import prisma from "../utils/prisma.js";

export const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const cart = await prisma.cart.findMany({
      where: {
        user_id,
      },
      include: {
        product: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Cart found",
      cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    // cari di cart apakah ada product yang sama jika ada tambahkan quantity
    const cartFind = await prisma.cart.findFirst({
      where: {
        user_id: user_id,
        product_id: product_id,
      },
    });

    if (cartFind) {
      const updateCart = await prisma.cart.update({
        where: {
          id: cartFind.id,
        },
        data: {
          quantity: cartFind.quantity + quantity,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Product added to cart",
        data: updateCart,
      });
    }

    const createCart = await prisma.cart.create({
      data: {
        user_id,
        product_id,
        quantity,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: createCart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const deleteCart = await prisma.cart.deleteMany({
      where: {
        user_id,
        product_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      data: deleteCart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
