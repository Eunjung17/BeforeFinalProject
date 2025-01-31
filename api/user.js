const { prisma, express } = require("../common");
const router = express.Router();
const bcrypt = require("bcrypt");
module.exports = router;
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/", (req, res) => {
    res.status(200).json({ message: "This works." });
});


const createToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "8h" });
};

const isLoggedIn = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.slice(7);
    if (!token) return next();
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findFirstOrThrow({
        where: {
          id,
        },
      });
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
};

router.post("/register", async(req, res, next) => {
    try {
        const { email, first_name, last_name , password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if(existingUser) return res.status(400).json({ message: "Username already taken" });

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        
        const response = await prisma.user.create({
            data: {
                email,
                first_name,
                last_name,
                password: hashPassword,
            },
        });

        if(response.id){
            const token = createToken(response.id);
            res.status(201).json(token);
        }else{
            res.status(400).json({  message: "Please try again later." });
        }


    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const match = bcrypt.compare(password, user.password);
      if (match) {
        const token = createToken(user.id);
        return res.json({ token });
      }
    } catch (error) {
      next(error);
    }
  });

  router.get('/aboutMe', isLoggedIn, async (req, res, next) => {
    try {
      let response;
  
      if (!req.user) {
        res.status(401).json({ message: 'Not Authorized' });
      } else {
        response = await prisma.user.findFirstOrThrow({
          where: {
            id: req.user.id,
          },
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        });
      }
  
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });
  
  router.get('/allUsers', isLoggedIn, async (req, res, next) => {

    try {
      let response;
  
      if (!req.user) {
        res.status(401).json({ message: 'Not Authorized' });
      } else {
        response = await prisma.user.findMany({
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        });
      }
  
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });
  
  router.get('/single-user', isLoggedIn, async (req, res, next) => {
    try {
      const response = await prisma.user.findUniqueOrThrow({
        where: {
          id: req.user.id,
        },
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(401).send({ message: 'Not authorized.' });
    }
  });
  // delete endpoint for the user
  
  router.delete('/users', isLoggedIn, async (req, res, next) => {
  
    try {
  
      if (!req.user) {
        res.status(401).json({ message: 'Not Authorized' });
      } else {
        await prisma.user.delete({
          where: { id: req.user.id },
        });
      }
      res.sendStatus(204);
  
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user.'});
    }
  
  });
  
  router.put('/users', isLoggedIn, async (req, res, next) => {
  
    try {
  
      if (!req.user) {
        res.status(401).json({ message: 'Not Authorized' });
      } else {
  
        const { email, first_name, last_name, password } = req.body;
  
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        
        const response = await prisma.user.update({
          where: { id: req.user.id },
          data: {
            email,
            first_name,
            last_name, 
            password: hashPassword,
          },
        });
  
        res.status(200).json(response);
      }
  
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user.'});
    }
  
  });  