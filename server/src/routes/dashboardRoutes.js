import express from 'express';

const router = express.Router();

router.get('/appointments', async (req, res) => {
    console.log("wtf");
    res.json(["Appointment 1", "Appointment 2", "Appointment 3"]);
});








export default router


