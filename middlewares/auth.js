import prisma from "../utils/prisma.js";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const tokenCheck = await prisma.token.findUnique({
      where: {
        token,
      },
      select: {
        logout_time: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
          },
        },
        token: true,
        login_time: true,
        user_id: true,
        id: true,
      },
    });

    if (!tokenCheck) {
      return res.status(401).json({
        success: false,
        message: "Token Invalid",
      });
    }

    if (tokenCheck.logout_time) {
      return res.status(401).json({
        success: false,
        message: "Token Expired",
      });
    }

    req.user = tokenCheck.user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export default auth;
