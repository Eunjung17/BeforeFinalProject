const { express } = require("./common");
const app = express();
app.use(express.json());
const cors = require('cors');
const PORT = 3000;

app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
);

app.use("/", require("./api/user"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({messgage: "Somthing went wrong."});
});

app.listen(PORT, () => {
    console.log(`I am listening on port number ${PORT}`);
}); 

