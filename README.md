# Rare Crate
Production site here: https://rarecrate.vercel.app/

## PlanetScale Local Development
You will likely be working with PlanetScale in the following capacities:
- Using the development db data to build locally
- Making changes to the development db schema
- Deploying changes for the development db schema to production

### PRE-REQUISITE: Install PlanetScale CLI
Pre-requisite to install PlanetScale CLI - by running the following commands on a Mac:

- `brew install planetscale/tap/pscale`
- `brew install mysql-client`
- `brew upgrade pscale`

From: https://github.com/planetscale/cli#installation (+ instructions for other OS)

### Using the Development DB Data to Build Locally

- Open a connection to the development branch so your local env can use it for development.
    - In a new terminal tab, run `pscale connect rarecrate development`
        - `development` is the branch used for local development data
    - In your main terminal tab, run `yarn dev`
        - `.env.development` is configured to connect to the PlanetScale development DB branch 

*Note: we use the recommended username + pw connection vs. the proxy connection. For more information, see: https://planetscale.com/docs/tutorials/connect-any-application*

### Making changes to the development db schema
Whereas normally for a paid PlanetScale account you can create multiple development branches, our free account uses only a development and production branch; therefore any changes to the schema will entail the following:

- Make sure you are connected to the development branch:
    - In a new terminal tab, run `pscale connect rarecrate development`
- Next, make your changes to the application and the Prisma Schema as needed, and push those changes to the development branch:
    - `yarn db:push` will push your schema changes up to the development branch.
    - Your local app development can use those new fields immediately once they are pushed to the DB branch.

### Deploying Changes for the Development DB Schema to Production Branch
- Once your development branch is ready and everything is working locally, you can create a deploy request for the migration:
    - `pscale deploy-request create rarecrate development`
        - This will create a PR within PlanetScale where you can check out the migration and where PlanetScale will highlight any schema conflicts that may occur with this change.
- Once the migration has been looked over and approved, you can merge the deploy-request using one of two methods:
    - Deploy through the PlanetScale dashboard, which will update the schema on `development` branch.
    - Take note of the deploy request # from the previous command and run `pscale deploy-request deploy rarecrate deploy-request-number`. If successful, you should see a message like `Successfully queued [some id] from development for deployment to main.`

### Backfilling Data
Keep in mind that when updating schemas locally and in production, you will need to do a separate data migration task (both for development and production), as PlanetScale deployments only update the database schemas.
