const db = require("../config/db");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.getEpisode = catchAsyncErrors(async (req, res, next) => {
  const { id, season_num, episode } = req.params;

  if (!Number(episode)) {
    return next(new ErrorHandler("Invalid Episode Number", 400));
  }
  if (!Number(season_num)) {
    return next(new ErrorHandler("Invalid Season Number", 400));
  }

  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );
  if (content.rowCount === 0) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const season = await db.query(
    "SELECT source_id FROM content_sources WHERE content_id = $1 AND season = $2",
    [id, season_num]
  );
  if (season.rowCount === 0) {
    return next(new ErrorHandler("Season Not Found", 404));
  }

  const episodeFound = await db.query(
    `SELECT content_sources.*,
            app_sources.source_name,
            app_sources.source_url
     FROM content_sources, app_sources
     WHERE content_sources.source_id = app_sources.source_id
           AND content_sources.content_id  = $1
           AND content_sources.season = $2
           AND content_sources.episode = $3          
    `,
    [id, season_num, episode]
  );

  if (episodeFound.rowCount === 0) {
    return next(new ErrorHandler("Episode Not Found", 404));
  }

  res.status(200).json({
    success: true,
    data: episodeFound.rows[0],
  });
});

exports.addEpisode = catchAsyncErrors(async (req, res, next) => {
  const { id, season_num } = req.params;
  const { source_name, source_url, episode } = req.body;

  if (!Number(episode)) {
    return next(new ErrorHandler("Invalid Episode Number", 400));
  }

  if (!Number(season_num)) {
    return next(new ErrorHandler("Invalid Season Number", 400));
  }

  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (content.rowCount === 0) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const season = await db.query(
    "SELECT source_id FROM content_sources WHERE content_id = $1 AND season = $2",
    [id, season_num]
  );
  if (season.rowCount === 0) {
    return next(new ErrorHandler("Season Not Found", 404));
  }

  //Cannot add more than one source for movies/films
  if (content.rows[0].content_type === "SINGLE" && season.rowCount !== 0) {
    return next(
      new ErrorHandler("Cannot Add Another Source To This Content", 400)
    );
  }

  const duplicateEpisode = await db.query(
    ` SELECT * FROM content_sources 
      WHERE content_id = $1 AND season = $2 AND episode = $3
    `,
    [id, season_num, episode]
  );
  if (duplicateEpisode.rowCount !== 0) {
    return next(
      new ErrorHandler(
        `Episode ${episode} already exists for Season ${season_num} of ${content.rows[0].content_name}`,
        400
      )
    );
  }

  const newSource = await db.query(
    ` INSERT into app_sources(source_name, source_url)
        VALUES($1, $2)
        RETURNING *
      `,
    [source_name, source_url]
  );

  const newContentSource = await db.query(
    ` INSERT into content_sources(content_id, source_id, season, episode)
    VALUES($1, $2, $3, $4)
        RETURNING *
    `,
    [
      content.rows[0].content_id,
      newSource.rows[0].source_id,
      season_num,
      episode,
    ]
  );

  res.status(200).json({
    success: true,
    source_data: newSource.rows[0],
    content_source: newContentSource.rows[0],
  });
});

exports.updateEpisode = catchAsyncErrors(async (req, res, next) => {
  const { id, season_num, episode } = req.params;
  const { new_episode_num } = req.body;
  if (!Number(episode)) {
    return next(new ErrorHandler("Invalid Episode Number", 400));
  }

  if (!Number(season_num)) {
    return next(new ErrorHandler("Invalid Season Number", 400));
  }

  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (content.rowCount === 0) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const season = await db.query(
    "SELECT source_id FROM content_sources WHERE content_id = $1 AND season = $2",
    [id, season_num]
  );
  if (season.rowCount === 0) {
    return next(new ErrorHandler("Season Not Found", 404));
  }

  const episodeExists = await db.query(
    ` SELECT * FROM content_sources 
      WHERE content_id = $1 AND season = $2 AND episode = $3
    `,
    [id, season_num, episode]
  );
  if (episodeExists.rowCount === 0) {
    return next(
      new ErrorHandler(
        `Episode ${episode} does not exist for Season ${season_num} of ${content.rows[0].content_name}`,
        400
      )
    );
  }

  const duplicateEpisode = await db.query(
    ` SELECT * FROM content_sources
      WHERE content_id = $1 AND season = $2 AND episode = $3
    `,
    [id, season_num, new_episode_num]
  );
  if (duplicateEpisode.rowCount !== 0) {
    return next(
      new ErrorHandler(
        `Episode ${episode} already exists for Season ${season_num} of ${content.rows[0].content_name}`,
        400
      )
    );
  }

  const newEpisode = await db.query(
    ` UPDATE content_sources
      SET episode = $1
      WHERE content_id = $2 AND source_id = $3
      RETURNING *
    `,
    [new_episode_num, id, episodeExists.rows[0].source_id]
  );

  res.status(200).json({
    success: true,
    data: newEpisode.rows[0],
  });
});

exports.deleteEpisode = catchAsyncErrors(async (req, res, next) => {
  const { id, season_num, episode } = req.params;

  if (!Number(episode)) {
    return next(new ErrorHandler("Invalid Episode Number", 400));
  }

  if (!Number(season_num)) {
    return next(new ErrorHandler("Invalid Season Number", 400));
  }

  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (content.rowCount === 0) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const season = await db.query(
    "SELECT source_id FROM content_sources WHERE content_id = $1 AND season = $2",
    [id, season_num]
  );
  if (season.rowCount === 0) {
    return next(new ErrorHandler("Season Not Found", 404));
  }

  const episodeExists = await db.query(
    ` SELECT * FROM content_sources 
      WHERE content_id = $1 AND season = $2 AND episode = $3
    `,
    [id, season_num, episode]
  );
  if (episodeExists.rowCount === 0) {
    return next(
      new ErrorHandler(
        `Episode ${episode} does not exist for Season ${season_num} of ${content.rows[0].content_name}`,
        400
      )
    );
  }

  await db.query(
    ` DELETE FROM content_sources 
      WHERE content_id = $1 AND season = $2 AND episode = $3
    `,
    [id, season_num, episode]
  );
  await db.query(
    ` DELETE FROM app_sources
      WHERE source_id = $1
    `,
    [episodeExists.rows[0].source_id]
  );

  res.status(200).json({
    success: true,
  });
});
