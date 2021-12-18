import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeadlineColumnInPollTable1639772969440 implements MigrationInterface {
    name = 'AddDeadlineColumnInPollTable1639772969440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "FK_ce69ed4c96964be74d3d57e89cb" FOREIGN KEY ("vote_right_id") REFERENCES "vote_right" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT "FK_d17980c91005358383b7ad59ab0" FOREIGN KEY ("option_id") REFERENCES "option" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT)`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
        await queryRunner.query(`CREATE TABLE "temporary_poll" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL, "deadline" datetime NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_poll"("id", "user_id") SELECT "id", "user_id" FROM "poll"`);
        await queryRunner.query(`DROP TABLE "poll"`);
        await queryRunner.query(`ALTER TABLE "temporary_poll" RENAME TO "poll"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "UQ_1f4ba94e11f0f6afec9cb013d4e" UNIQUE ("vote_right_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "UQ_1f4ba94e11f0f6afec9cb013d4e" UNIQUE ("vote_right_id"), CONSTRAINT "FK_d17980c91005358383b7ad59ab0" FOREIGN KEY ("option_id") REFERENCES "option" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT "FK_ce69ed4c96964be74d3d57e89cb" FOREIGN KEY ("vote_right_id") REFERENCES "vote_right" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT)`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "UQ_1f4ba94e11f0f6afec9cb013d4e" UNIQUE ("vote_right_id"))`);
        await queryRunner.query(`INSERT INTO "vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL)`);
        await queryRunner.query(`INSERT INTO "vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "FK_ce69ed4c96964be74d3d57e89cb" FOREIGN KEY ("vote_right_id") REFERENCES "vote_right" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT)`);
        await queryRunner.query(`INSERT INTO "vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
        await queryRunner.query(`ALTER TABLE "poll" RENAME TO "temporary_poll"`);
        await queryRunner.query(`CREATE TABLE "poll" ("id" varchar PRIMARY KEY NOT NULL, "user_id" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "poll"("id", "user_id") SELECT "id", "user_id" FROM "temporary_poll"`);
        await queryRunner.query(`DROP TABLE "temporary_poll"`);
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("option_id" varchar NOT NULL, "vote_right_id" varchar PRIMARY KEY NOT NULL, CONSTRAINT "FK_ce69ed4c96964be74d3d57e89cb" FOREIGN KEY ("vote_right_id") REFERENCES "vote_right" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT, CONSTRAINT "FK_d17980c91005358383b7ad59ab0" FOREIGN KEY ("option_id") REFERENCES "option" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT)`);
        await queryRunner.query(`INSERT INTO "vote"("option_id", "vote_right_id") SELECT "option_id", "vote_right_id" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
    }

}
