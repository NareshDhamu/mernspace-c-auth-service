import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Wellcome to Auth service");
});
export default app;
