import { createConnection, getConnection } from "typeorm";
import { entities } from "./entities";
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
}
