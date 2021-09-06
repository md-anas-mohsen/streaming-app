const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

let toDelete;
let toDelete2;
let seasonToDelete;

chai.use(chaiHttp);

suite("App Tests", () => {
  suite("Content Tests", () => {
    suite("Create Content Tests", () => {
      test("Create content with every field", (done) => {
        chai
          .request(server)
          .post("/api/admin/content")
          .set("content-type", "application/json")
          .send({
            content_name: "Content",
            content_type: "SINGLE",
            category: "action",
            start_date: "2013",
            end_date: "2013",
            image: "freeimage.com/image.jpg",
            cover_image: "freeimage.com/cover.jpg",
            description: "description",
            cast_members: "actor 1, actress 1, actor 2, actress 2",
            production_house: "big production house",
            writer: "Mr. Writer",
            director: "Ms. Director",
            producer: "Producer",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            toDelete = res.body.data.content_id;
            assert.equal(res.body.success, true);
            assert.equal(res.body.data.content_name, "Content");
            assert.equal(res.body.data.content_type, "SINGLE");
            assert.equal(res.body.data.category, "action");
            assert.equal(res.body.data.start_date, "2013");
            assert.equal(res.body.data.end_date, "2013");
            assert.equal(res.body.data.image, "freeimage.com/image.jpg");
            assert.equal(res.body.data.cover_image, "freeimage.com/cover.jpg");
            assert.equal(res.body.data.description, "description");
            assert.equal(
              res.body.data.cast_members,
              "actor 1, actress 1, actor 2, actress 2"
            );
            assert.equal(
              res.body.data.production_house,
              "big production house"
            );
            assert.equal(res.body.data.writer, "Mr. Writer");
            assert.equal(res.body.data.director, "Ms. Director");
            assert.equal(res.body.data.producer, "Producer");
            done();
          });
      });

      test("Create content with some fields", (done) => {
        chai
          .request(server)
          .post("/api/admin/content")
          .set("content-type", "application/json")
          .send({
            content_name: "Content2",
            content_type: "MULTIPLE",
            category: "action",
            start_date: "2014",
            image: "freeimage.com/image2.jpg",
            description: "description",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            toDelete2 = res.body.data.content_id;
            assert.equal(res.body.success, true);
            assert.equal(res.body.data.content_name, "Content2");
            assert.equal(res.body.data.content_type, "MULTIPLE");
            assert.equal(res.body.data.category, "action");
            assert.equal(res.body.data.start_date, "2014");
            assert.equal(res.body.data.image, "freeimage.com/image2.jpg");
            assert.equal(res.body.data.description, "description");
            done();
          });
      });
    });

    suite("Retreive Content Tests", () => {
      test("Get All Content", (done) => {
        chai
          .request(server)
          .get("/api/content")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.isArray(res.body.data);
            assert.isAtLeast(res.body.data.length, 2);
            assert.isDefined(res.body.data[0].content_id);
            assert.isDefined(res.body.data[1].content_id);
            done();
          });
      });

      test("Get Specific Content", (done) => {
        chai
          .request(server)
          .get(`/api/content/${toDelete}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.data.content_id, toDelete);
            done();
          });
      });

      test("Show Error on Non-Existent Content", (done) => {
        chai
          .request(server)
          .get(`/api/content/22091055-b790-4c38-a42f-23dc1c733d09`)
          .end(function (err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.body.success, false);
            assert.isUndefined(res.body.data);
            done();
          });
      });

      test("Show Error on Invalid Content UUID", (done) => {
        chai
          .request(server)
          .get(`/api/content/2209`)
          .end(function (err, res) {
            assert.equal(res.status, 500);
            assert.equal(res.body.success, false);
            assert.isUndefined(res.body.data);
            assert.equal(res.body.error.routine, "string_to_uuid");
            done();
          });
      });

      test("Get Specific Content Again", (done) => {
        chai
          .request(server)
          .get(`/api/content/${toDelete2}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.data.content_id, toDelete2);
            done();
          });
      });
    });

    suite("Update Content Tests", () => {
      test("Update Specific Content", (done) => {
        chai
          .request(server)
          .put(`/api/admin/content/${toDelete}`)
          .set("content-type", "application/json")
          .send({
            content_name: "Content New",
            start_date: "2015",
            description: "description new",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.equal(res.body.data.content_name, "Content New");
            assert.equal(res.body.data.start_date, "2015");
            assert.equal(res.body.data.description, "description new");
            done();
          });
      });
    });

    suite("Add Season Tests", () => {
      test("Add Season", (done) => {
        chai
          .request(server)
          .post(`/api/admin/content/${toDelete}`)
          .set("content-type", "application/json")
          .send({
            source_name: "Content Source",
            source_url: "video.com/video",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.exists(res.body.source_data);
            assert.exists(res.body.content_source);
            assert.equal(res.body.source_data.source_name, "Content Source");
            assert.equal(res.body.source_data.source_url, "video.com/video");
            seasonToDelete = res.body.content_source.season;
            assert.equal(res.body.content_source.season, "1");
            done();
          });
      });

      test("Disallow Adding Another Season To A Movie ", (done) => {
        chai
          .request(server)
          .post(`/api/admin/content/${toDelete}`)
          .set("content-type", "application/json")
          .send({
            source_name: "Content Source 2",
            source_url: "video.com/video2",
          })
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.body.success, false);
            assert.isUndefined(res.body.source_data);
            assert.isUndefined(res.body.content_source);
            done();
          });
      });

      test("Add Season to Another Content", (done) => {
        chai
          .request(server)
          .post(`/api/admin/content/${toDelete2}`)
          .set("content-type", "application/json")
          .send({
            source_name: "Content2 Source",
            source_url: "video.com/video",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.exists(res.body.source_data);
            assert.exists(res.body.content_source);
            assert.equal(res.body.source_data.source_name, "Content2 Source");
            assert.equal(res.body.source_data.source_url, "video.com/video");
            seasonToDelete = res.body.content_source.season;
            assert.equal(res.body.content_source.season, "1");
            done();
          });
      });
    });

    suite("Add Episode Tests", () => {
      test("Add Episode to Content's season", (done) => {
        chai
          .request(server)
          .post(`/api/admin/content/${toDelete2}/1`)
          .set("content-type", "application/json")
          .send({
            source_name: "Content Source 2",
            source_url: "video.com/video2",
            episode: "2",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.isDefined(res.body.source_data);
            assert.isDefined(res.body.content_source);
            done();
          });
      });

      test("Disallow Adding Duplicate Episode", (done) => {
        chai
          .request(server)
          .post(`/api/admin/content/${toDelete2}/1`)
          .set("content-type", "application/json")
          .send({
            source_name: "Content Source 2",
            source_url: "video.com/video2",
            episode: "1",
          })
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.body.success, false);
            assert.isUndefined(res.body.source_data);
            assert.isUndefined(res.body.content_source);
            assert.equal(
              res.body.errMessage,
              "Episode 1 already exists for Season 1 of Content2"
            );
            done();
          });
      });
    });

    suite("Edit Episode Tests", () => {
      test("Edit An Episode", (done) => {
        chai
          .request(server)
          .put(`/api/admin/content/${toDelete2}/1/1`)
          .set("content-type", "application/json")
          .send({
            new_episode_num: "2",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            assert.isDefined(res.body.source_data);
            assert.isDefined(res.body.content_source);
            assert.equal(res.body.data.episode, "2");
            done();
          });
      });
    });

    suite("Delete Episode Tests", () => {
      test("Delete An Episode", (done) => {
        chai
          .request(server)
          .delete(`/api/admin/content/${toDelete2}/1/2`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            done();
          });
      });
    });

    suite("Delete Season Tests", () => {
      test("Delete A Season", (done) => {
        chai
          .request(server)
          .delete(`/api/admin/content/${toDelete}/${seasonToDelete}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            done();
          });
      });
    });

    suite("Delete Content Tests", () => {
      test("Delete Content", (done) => {
        chai
          .request(server)
          .delete(`/api/admin/content/${toDelete}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            done();
          });
      });

      test("Delete Another Content", (done) => {
        chai
          .request(server)
          .delete(`/api/admin/content/${toDelete2}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, true);
            done();
          });
      });
    });
  });
});
