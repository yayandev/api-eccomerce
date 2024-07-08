import prisma from "../utils/prisma.js";

export const createReview = async (req, res) => {
  try {
    const { comment, rating, product_id } = req.body;
    const user_id = req.user.id;

    if (!comment || !rating || !product_id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const reviewAlreadyExists = await prisma.review.findFirst({
      where: {
        product_id,
        user_id,
      },
    });

    if (reviewAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Review already exists",
      });
    }

    const review = await prisma.review.create({
      data: {
        comment,
        rating,
        product_id,
        user_id: req.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
