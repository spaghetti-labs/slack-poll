import { createConnection, getConnection } from "typeorm";
import { entities } from "./entities";
import { PollEntity } from "./entities/poll";
import { migrations } from "./migrations";

export async function connectDB(
    path: string,
): Promise<void> {
    try {
        await getConnection().close()
    } catch (err) {}

    await createConnection({
        type: "sqlite",
        database: path,
        entities,
        migrations,
        migrationsRun: true,
    })

    console.log(`Connected to the DB at the file ${path}.`)
    const pollCount = await PollEntity.count()
    console.log(`${pollCount} polls found in the db.`)
}
