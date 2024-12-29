import knex from "knex"
import path from "path"

export default knex({
  client: "better-sqlite3", // or 'better-sqlite3'
  connection: {
    filename: path.join(process.cwd(), "/src/Learnbase.db"),
  },
})
