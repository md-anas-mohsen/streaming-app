const {
  createContent,
  getAllContent,
  getContentById,
  deleteContent,
  updateContent,
} = require("../controllers/contentController");
const {
  getEpisode,
  addEpisode,
  updateEpisode,
  deleteEpisode,
} = require("../controllers/episodeController");
const {
  createSeason,
  deleteSeason,
  getSeason,
} = require("../controllers/seasonController");

const router = require("express").Router();

router.get("/content", getAllContent);
router.get("/content/:id", getContentById);
router.get("/content/:id/:season_num", getSeason);
router.get("/content/:id/:season_num/:episode", getEpisode);

router.post("/admin/content", createContent);
router.put("/admin/content/:id", updateContent);
router.delete("/admin/content/:id", deleteContent);

router.post("/admin/content/:id", createSeason);
router.delete("/admin/content/:id/:season_num", deleteSeason);

router.post("/admin/content/:id/:season_num", addEpisode);
router.put("/admin/content/:id/:season_num/:episode", updateEpisode);
router.delete("/admin/content/:id/:season_num/:episode", deleteEpisode);

module.exports = router;
