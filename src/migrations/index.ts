import * as migration_20261001_195900_add_user_roles from './20261001_195900_add_user_roles'
import * as migration_20261002_120000_language_region_split from './20261002_120000_language_region_split'
import * as catalogPageContent from './20261028_160000_catalog_page_content'

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
  {
    up: catalogPageContent.up,
    down: catalogPageContent.down,
    name: '20261028_160000_catalog_page_content',
  },
]
