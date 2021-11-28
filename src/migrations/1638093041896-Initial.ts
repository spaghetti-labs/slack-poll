import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1638093041896 implements MigrationInterface {
    name = 'Initial1638093041896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "REL_ce69ed4c96964be74d3d57e89c" UNIQUE ("vote_right_id"))`);
        await queryRunner.query(`CREATE TABLE "vote_right" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "poll_id" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "poll" ("id" varchar PRIMARY KEY NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "option" ("id" varchar PRIMARY KEY NOT NULL, "text" text NOT NULL, "poll_id" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "REL_ce69ed4c96964be74d3d57e89c" UNIQUE ("vote_right_id"), CONSTRAINT "FK_d17980c91005358383b7ad59ab0" FOREIGN KEY ("option_id") REFERENCES "option" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT "FK_ce69ed4c96964be74d3d57e89cb" FOREIGN KEY ("vote_right_id") REFERENCES "vote_right" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT)`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote_right" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "poll_id" varchar NOT NULL, CONSTRAINT "FK_9bbaacc5bbedf339f4d525b62ef" FOREIGN KEY ("poll_id") REFERENCES "poll" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT)`);
        await queryRunner.query(`INSERT INTO "temporary_vote_right"("id", "user_id", "poll_id") SELECT "id", "user_id", "poll_id" FROM "vote_right"`);
        await queryRunner.query(`DROP TABLE "vote_right"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote_right" RENAME TO "vote_right"`);
        await queryRunner.query(`CREATE TABLE "temporary_option" ("id" varchar PRIMARY KEY NOT NULL, "text" text NOT NULL, "poll_id" varchar NOT NULL, CONSTRAINT "FK_f66b8a7dba0ed0aca27ac536516" FOREIGN KEY ("poll_id") REFERENCES "poll" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT)`);
        await queryRunner.query(`INSERT INTO "temporary_option"("id", "text", "poll_id") SELECT "id", "text", "poll_id" FROM "option"`);
        await queryRunner.query(`DROP TABLE "option"`);
        await queryRunner.query(`ALTER TABLE "temporary_option" RENAME TO "option"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "option" RENAME TO "temporary_option"`);
        await queryRunner.query(`CREATE TABLE "option" ("id" varchar PRIMARY KEY NOT NULL, "text" text NOT NULL, "poll_id" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "option"("id", "text", "poll_id") SELECT "id", "text", "poll_id" FROM "temporary_option"`);
        await queryRunner.query(`DROP TABLE "temporary_option"`);
        await queryRunner.query(`ALTER TABLE "vote_right" RENAME TO "temporary_vote_right"`);
        await queryRunner.query(`CREATE TABLE "vote_right" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "poll_id" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "vote_right"("id", "user_id", "poll_id") SELECT "id", "user_id", "poll_id" FROM "temporary_vote_right"`);
        await queryRunner.query(`DROP TABLE "temporary_vote_right"`);
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "REL_ce69ed4c96964be74d3d57e89c" UNIQUE ("vote_right_id"))`);
        await queryRunner.query(`INSERT INTO "vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "option"`);
        await queryRunner.query(`DROP TABLE "poll"`);
        await queryRunner.query(`DROP TABLE "vote_right"`);
        await queryRunner.query(`DROP TABLE "vote"`);
    }

}
