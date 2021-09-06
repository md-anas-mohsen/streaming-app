const db = require("../config/db");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

exports.getAllContent = catchAsyncErrors(async (req, res, next) => {
  const allContent = await db.query("SELECT * FROM app_content");
  res.status(200).json({
    success: true,
    data: allContent.rows,
  });
});

exports.createContent = catchAsyncErrors(async (req, res, next) => {
  const {
    content_name,
    content_type,
    category,
    start_date,
    end_date,
    image,
    cover_image,
    description,
    cast_members,
    production_house,
    writer,
    director,
    producer,
  } = req.body;
  const content = await db.query(
    ` INSERT INTO app_content (
        content_name,
        content_type,
        category,
        start_date,
        end_date,
        image,
        cover_image,
        description,
        cast_members,
        production_house,
        writer,
        director,
        producer
      ) 
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *
    `,
    [
      content_name,
      content_type,
      category,
      start_date,
      end_date,
      image,
      cover_image,
      description,
      cast_members,
      production_house,
      writer,
      director,
      producer,
    ]
  );
  res.status(200).json({
    success: true,
    data: content.rows[0],
  });
});

exports.getContentById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (!content.rows[0]) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  res.status(200).json({
    success: true,
    data: content.rows[0],
  });
});

exports.updateContent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {
    content_name,
    content_type,
    category,
    start_date,
    end_date,
    image,
    cover_image,
    description,
    cast_members,
    production_house,
    writer,
    director,
    producer,
  } = req.body;

  const oldContent = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (!oldContent.rows[0]) {
    return next(new ErrorHandler("Content Not Found", 404));
  }

  const newContent = await db.query(
    ` UPDATE app_content 
      SET content_name = $1,
          content_type = $2,
          category = $3,
          start_date = $4,
          end_date = $5,
          image = $6,
          cover_image = $7,
          description = $8,
          cast_members = $9,
          production_house = $10,
          writer = $11,
          director = $12,
          producer = $13
      WHERE content_id = $14
      RETURNING *
    `,
    [
      content_name || oldContent.rows[0].content_name,
      content_type || oldContent.rows[0].content_type,
      category || oldContent.rows[0].category,
      start_date || oldContent.rows[0].start_date,
      end_date || oldContent.rows[0].end_date,
      image || oldContent.rows[0].image,
      cover_image || oldContent.rows[0].cover_image,
      description || oldContent.rows[0].description,
      cast_members || oldContent.rows[0].cast_members,
      production_house || oldContent.rows[0].production_house,
      writer || oldContent.rows[0].writer,
      director || oldContent.rows[0].director,
      producer || oldContent.rows[0].producer,
      id,
    ]
  );

  if (newContent.rowCount !== 0) {
    return res.status(200).json({
      success: true,
      data: newContent.rows[0],
    });
  }

  return next(new ErrorHandler("Could Not Update Content", 500));
});

exports.deleteContent = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let content = await db.query(
    "SELECT * FROM app_content WHERE content_id = $1",
    [id]
  );

  if (content.rowCount === 0) {
    return next(new ErrorHandler("Content Not Found", 404));
  }
  const seasons = await db.query(
    "SELECT DISTINCT season FROM content_sources WHERE content_id = $1",
    [id]
  );

  seasons.rows.forEach(async (seasonData) => {
    const season_num = seasonData.season;
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
  });

  await db.query("DELETE FROM app_content WHERE content_id = $1", [id]);

  res.status(200).json({
    success: true,
  });
});
