import * as migration_20261001_195900_add_user_roles from './20261001_195900_add_user_roles'
import * as migration_20261002_120000_language_region_split from './20261002_120000_language_region_split'

export const migrations = [
  {
    up: migration_20261001_195900_add_user_roles.up,
    down: migration_20261001_195900_add_user_roles.down,
    name: '20261001_195900_add_user_roles',
  },
  {
    up: migration_20261002_120000_language_region_split.up,
    down: migration_20261002_120000_language_region_split.down,
    name: '20261002_120000_language_region_split',
  },
]
