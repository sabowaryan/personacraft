import { defineConfig } from 'prisma/config'

export default defineConfig({
    // Schema location (default: ./prisma/schema.prisma)
    schema: 'prisma/schema.prisma',

    // Migrations configuration
    migrations: {
        path: 'prisma/migrations'
    }
})