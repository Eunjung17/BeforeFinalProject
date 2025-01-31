const { express } = require("./common");
const app = express();
app.use(express.json());
const PORT = 3000;

app.use("/", require("./api/user"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({messgage: "Somthing went wrong."});
});

app.listen(PORT, () => {
    console.log(`I am listening on port number ${PORT}`);
}); 