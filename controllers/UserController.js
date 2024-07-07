import prisma from "../utils/prisma.js";
import bcryptjs from "bcryptjs";
import UAParser from "ua-parser-js";

function generateUniqueToken(userId) {
  const date = new Date().toISOString(); // Dapatkan tanggal saat ini dalam format ISO
  const randomValue = Math.random().toString(36).substring(2); // Buat nilai acak

  // Gabungkan userId, tanggal, dan nilai acak
  const rawToken = `${userId}-${date}-${randomValue}`;

  // Encode raw token menggunakan base64
  const uniqueToken = btoa(rawToken);

  return uniqueToken;
}

function getClientIp(req) {
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Konversi IPv4-mapped IPv6 address ke IPv4
  if (ip.startsWith("::ffff:")) {
    ip = ip.split(":").pop();
  }

  return ip;
}

// Fungsi untuk mendapatkan informasi klien
function getClientInfo(req) {
  const userAgent = req.headers["user-agent"] || "unknown";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const device =
    req.headers["x-device-type"] || result.device.type || "unknown";
  const os = result.os.name || "unknown";
  const browser = result.browser.name || "unknown";
  return { os, browser, device };
}

// Fungsi untuk mendapatkan lokasi berdasarkan IP
function getClientLocation(ip) {
  return "unknown";
}

export const createUser = async (req, res) => {
  try {
    const body = req.body;

    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const emailAlreadyExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (emailAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successsfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      messsage: "Internal Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        successs: false,
        message: "All fields are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const isMatch = await bcryptjs.compare(password, user.password);
      if (isMatch) {
        const token = generateUniqueToken(user.id);
        const login_time = new Date().toISOString();
        const ip = getClientIp(req);
        const { os, browser, device } = getClientInfo(req);
        const location = getClientLocation(ip);

        const createToken = await prisma.token.create({
          data: {
            token,
            login_time,
            user_id: user.id,
            ip,
            browser,
            os,
            device,
            location,
          },
        });

        if (!createToken) {
          return res.status(500).json({
            successs: false,
            message: "Internal Server Error",
          });
        }

        return res.status(200).json({
          successs: true,
          message: "User logged in successsfully",
          token,
          user,
        });
      }
    }

    return res.status(400).json({
      successs: false,
      message: "Invalid credentials",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      successs: false,
      message: "Internal Server Error",
    });
  }
};

export const currentUser = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      messsage: "Internal Server Error",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const logout_time = new Date().toISOString();

    const updateToken = await prisma.token.update({
      where: {
        token,
      },
      data: {
        logout_time,
      },
    });

    if (!updateToken) {
      return res.status(500).json({
        success: false,
        messsage: "Internal Server Error",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User logged out successsfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      messsage: "Internal Server Error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.user;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    const updateUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!updateUser) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      messsage: "Internal Server Error",
    });
  }
};
