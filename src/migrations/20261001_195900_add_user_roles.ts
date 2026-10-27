import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  await payload.db.collections.users.collection.updateMany(
    { role: { $exists: false } },
    { $set: { role: 'admin' } },
    { session },
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
