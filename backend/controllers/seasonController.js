const db = require("../config/db");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.getSeason = catchAsyncErrors(async (req, res, next) => {
  const { id, season_num } = req.params;

  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (!content.rows[0]) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const season = await db.query(
    "SELECT * FROM content_sources WHERE content_id = $1",
    [id]
  );

  if (!season.rows[0]) {
    return next(new ErrorHandler("Season Not Found", 404));
  }

  res.status(200).json({
    success: true,
    data: season.rows,
  });
});

exports.createSeason = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { source_name, source_url } = req.body;

  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (!content.rows[0]) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const getSeasonNum = await db.query(
    "SELECT DISTINCT season FROM content_sources WHERE content_id = $1",
    [id]
  );

  const season = getSeasonNum.rowCount + 1;

  //Cannot add more than one source for movies/films
  if (
    content.rows[0].content_type === "SINGLE" &&
    getSeasonNum.rowCount !== 0
  ) {
    return next(
      new ErrorHandler("Cannot Add Another Source To This Content", 400)
    );
  }

  const source = await db.query(
    `
        INSERT INTO app_sources (source_name, source_url) 
        VALUES($1, $2)
        RETURNING *
      `,
    [source_name, source_url]
  );

  if (!source.rows[0]) {
    return next(new ErrorHandler("Could Not Add Video Source", 500));
  }

  const content_source = await db.query(
    `
        INSERT INTO content_sources (content_id, source_id, season, episode)
        VALUES($1, $2, $3, $4)
        RETURNING *
      `,
    [content.rows[0].content_id, source.rows[0].source_id, season, 1]
  );

  if (!content_source.rows[0]) {
    return next(
      new ErrorHandler("Could Not Link Video Source To Content", 500)
    );
  }

  res.status(200).json({
    success: true,
    source_data: source.rows[0],
    content_source: content_source.rows[0],
  });
});

exports.deleteSeason = catchAsyncErrors(async (req, res, next) => {
  const { id, season_num } = req.params;

  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (!content.rows[0]) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const season = await db.query(
    "SELECT source_id FROM content_sources WHERE content_id = $1 AND season = $2",
    [id, season_num]
  );
  if (season.rowCount === 0) {
    return next(new ErrorHandler("Season Not Found", 404));
  }

  await db.query(
    "DELETE FROM content_sources WHERE content_id = $1 AND season = $2",
    [id, season_num]
  );

  const source_ids = season.rows.map((season) => season.source_id);

  //Since a season contains more than 1 episode, we have to generate the query string
  //for deletion dynamically
  let queryString = "IN(";

  source_ids.forEach((id, i) => {
    queryString += `$${i + 1}`;
    if (i !== source_ids.length - 1) {
      queryString += ", ";
    } else {
      queryString += ")";
    }
  });

  await db.query(`DELETE FROM app_sources WHERE source_id ${queryString}`, [
    ...source_ids,
  ]);

  await db.query(
    "DELETE FROM content_sources WHERE content_id = $1 AND season = $2",
    [id, season_num]
  );

  res.status(200).json({
    success: true,
  });
});
